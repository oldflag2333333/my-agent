import { afterEach, expect, test } from "bun:test"
import { Agent } from "../../src/agent/agent"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("core-only mode keeps neutral agents and defaults to general", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const list = await Agent.list()
      const native = list
        .filter((item) => item.native === true)
        .map((item) => item.name)
        .toSorted()

      expect(native).toEqual(["compaction", "general", "summary", "title"])
      expect(await Agent.get("build")).toBeUndefined()
      expect(await Agent.get("plan")).toBeUndefined()
      expect(await Agent.get("explore")).toBeUndefined()
      expect(await Agent.defaultAgent()).toBe("general")
      expect(list[0]?.name).toBe("general")
    },
  })
})
