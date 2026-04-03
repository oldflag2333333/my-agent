import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { Agent } from "../../../src/agent/agent"
import { PackRegistry } from "../../../src/pack/registry"
import { codingPack, packs } from "../../../src/pack/index"
import { Instance } from "../../../src/project/instance"
import { tmpdir } from "../../fixture/fixture"

const log = "../../.sisyphus/evidence/task-10-parity.log"

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

test("default coding pack keeps characterization parity across pack seams", async () => {
  PackRegistry.init(["coding"], packs)
  const a = await PackRegistry.agents()
  const t = await PackRegistry.tools()
  const p = await PackRegistry.prompts()
  const i = await PackRegistry.instructions()
  const n = a.map((item) => item.name)
  const ids = t.map((item) => item.id)

  expect(n).toContain("build")
  expect(n).toContain("plan")
  expect(n).toContain("explore")
  expect(ids).toContain("bash")
  expect(ids).toContain("apply_patch")
  expect(ids).toContain("codesearch")
  expect(p.some((item) => item.trim().length > 0)).toBeTrue()
  expect(i).toContain("AGENTS.md")
  expect(i).toContain("CONTEXT.md")
  expect(codingPack.onFileWrite).toBeDefined()

  await using tmp = await tmpdir({ config: { packs: ["coding"] } })
  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const list = await Agent.list()
      const names = list
        .filter((item) => item.native === true)
        .map((item) => item.name)
        .toSorted()

      expect(names).toEqual(["build", "compaction", "explore", "general", "plan", "summary", "title"])

      const build = await Agent.get("build")
      const plan = await Agent.get("plan")
      const explore = await Agent.get("explore")
      expect(build?.mode).toBe("primary")
      expect(plan?.mode).toBe("primary")
      expect(explore?.mode).toBe("subagent")

      await write({
        pack_agents: n,
        pack_tools: ids,
        pack_prompts: p.length,
        pack_instructions: i,
        native_agents: names,
        modes: {
          build: build?.mode,
          plan: plan?.mode,
          explore: explore?.mode,
        },
      })
    },
  })
})
