import { afterEach, expect, test } from "bun:test"
import { Agent } from "../../src/agent/agent"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("coding pack contributes build plan and explore agents", async () => {
  await using tmp = await tmpdir({ config: { packs: ["coding"] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const list = await Agent.list()
      const native = list
        .filter((item) => item.native === true)
        .map((item) => item.name)
        .toSorted()

      expect(native).toEqual(["build", "compaction", "explore", "general", "plan", "summary", "title"])
      expect(await Agent.get("build")).toBeDefined()
      expect(await Agent.get("plan")).toBeDefined()
      expect(await Agent.get("explore")).toBeDefined()
      expect(await Agent.defaultAgent()).toBe("build")
    },
  })
})
