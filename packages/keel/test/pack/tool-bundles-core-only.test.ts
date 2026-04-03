import { afterEach, expect, test } from "bun:test"
import { ToolRegistry } from "../../src/tool/registry"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("core-only tool bundle excludes coding tools", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const ids = await ToolRegistry.ids()

      expect(ids).toEqual([
        "invalid",
        "question",
        "read",
        "glob",
        "grep",
        "edit",
        "write",
        "task",
        "webfetch",
        "todowrite",
        "websearch",
        "skill",
      ])
      expect(ids).not.toContain("bash")
      expect(ids).not.toContain("apply_patch")
      expect(ids).not.toContain("codesearch")
      expect(ids).not.toContain("lsp")
    },
  })
})
