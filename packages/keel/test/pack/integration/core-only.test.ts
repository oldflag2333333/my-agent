import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { Agent } from "../../../src/agent/agent"
import { PackRegistry } from "../../../src/pack/registry"
import { packs } from "../../../src/pack/index"
import { Instance } from "../../../src/project/instance"
import { tmpdir } from "../../fixture/fixture"

const log = "../../.sisyphus/evidence/task-10-core-only.log"

async function write(data: unknown) {
  const text = `${JSON.stringify(data, null, 2)}\n`
  const prev = await Bun.file(log)
    .text()
    .catch(() => "")
  await Bun.write(log, prev + text)
}

afterEach(async () => {
  PackRegistry.init([], packs)
  await Instance.disposeAll()
})

test("empty packs keep a valid core-only runtime", async () => {
  PackRegistry.init([], packs)

  expect(await PackRegistry.agents()).toEqual([])
  expect(await PackRegistry.tools()).toEqual([])
  expect(await PackRegistry.prompts()).toEqual([])
  expect(await PackRegistry.instructions()).toEqual([])

  const out = await PackRegistry.onFileWrite("/tmp/test.ts")
  expect(out).toEqual({})

  await using tmp = await tmpdir({ config: { packs: [] } })
  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const list = await Agent.list()
      const primary = list.filter((item) => item.mode === "primary" && item.hidden !== true).map((item) => item.name)
      const native = list
        .filter((item) => item.native === true)
        .map((item) => item.name)
        .toSorted()

      expect(primary).toEqual(["general"])
      expect(native).toEqual(["compaction", "general", "summary", "title"])
      expect(await Agent.get("build")).toBeUndefined()
      expect(await Agent.get("plan")).toBeUndefined()
      expect(await Agent.get("explore")).toBeUndefined()
      expect(await Agent.defaultAgent()).toBe("general")
      expect(list[0]?.name).toBe("general")

      await write({
        pack_agents: await PackRegistry.agents(),
        pack_tools: await PackRegistry.tools(),
        pack_prompts: await PackRegistry.prompts(),
        pack_instructions: await PackRegistry.instructions(),
        hook: out,
        primary,
        native,
      })
    },
  })
})
