import { afterEach, expect, mock, test } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { ApplyPatchTool } from "../../src/tool/apply_patch"
import { packs } from "../../src/pack"
import { PackRegistry } from "../../src/pack"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"
import { SessionID, MessageID } from "../../src/session/schema"

const ctx = {
  sessionID: SessionID.make("ses_test-apply-patch-pack-hooks"),
  messageID: MessageID.make(""),
  callID: "",
  agent: "build",
  abort: AbortSignal.any([]),
  messages: [],
  metadata: () => {},
  ask: async () => {},
}

afterEach(async () => {
  await Instance.disposeAll()
  mock.restore()
})

test("apply_patch calls onFileWrite for edited files and returns diagnostics", async () => {
  const hit = mock(async (file: string) => {
    return {
      [file]: [
        {
          severity: 1,
          message: "patched file error",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
        },
      ],
    }
  })
  const hook = {
    id: "coding",
    onFileWrite: hit,
  }
  packs.push(hook)

  try {
    await using tmp = await tmpdir({ config: { packs: ["coding"] } })
    const target = path.join(tmp.path, "sample.txt")
    await fs.writeFile(target, "before\n", "utf-8")

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        PackRegistry.init(["coding"], packs)
        const tool = await ApplyPatchTool.init()
        const result = await tool.execute(
          {
            patchText: "*** Begin Patch\n*** Update File: sample.txt\n@@\n-before\n+after\n*** End Patch",
          },
          ctx,
        )
        expect(hit).toHaveBeenCalledTimes(1)
        expect(hit).toHaveBeenCalledWith(target)
        expect(result.metadata.diagnostics[target]).toBeDefined()
        expect(result.output).toContain("LSP errors detected in")
      },
    })
  } finally {
    packs.splice(packs.indexOf(hook), 1)
  }
})
