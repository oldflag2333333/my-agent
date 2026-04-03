import { afterEach, expect, test } from "bun:test"
import { Agent } from "../../../src/agent/agent"
import { Instance } from "../../../src/project/instance"
import { tmpdir } from "../../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("freezes built-in agent roster for coding runtime", async () => {
  await using tmp = await tmpdir()
  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const list: Awaited<ReturnType<typeof Agent.list>> = await Agent.list()
      const native = list
        .filter((item: Agent.Info) => item.native === true)
        .map((item: Agent.Info) => item.name)
        .toSorted()

      expect(native).toEqual(["build", "compaction", "explore", "general", "plan", "summary", "title"])

      const build = await Agent.get("build")
      const plan = await Agent.get("plan")
      const explore = await Agent.get("explore")
      expect(build?.mode).toBe("primary")
      expect(plan?.mode).toBe("primary")
      expect(explore?.mode).toBe("subagent")
    },
  })
})
