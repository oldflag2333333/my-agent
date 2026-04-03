import { afterEach, expect, test } from "bun:test"
import { ToolRegistry } from "../../src/tool/registry"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("coding pack contributes baseline tool roster", async () => {
  await using tmp = await tmpdir({ config: { packs: ["coding"] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      expect(await ToolRegistry.ids()).toEqual([
        "invalid",
        "question",
        "bash",
        "read",
        "glob",
        "grep",
        "edit",
        "write",
        "task",
        "webfetch",
        "todowrite",
        "websearch",
        "codesearch",
        "skill",
        "apply_patch",
      ])
    },
  })
})
