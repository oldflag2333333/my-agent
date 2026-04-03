import { afterEach, expect, mock, test } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { EditTool } from "../../src/tool/edit"
import { packs } from "../../src/pack"
import { PackRegistry } from "../../src/pack"
import { FileTime } from "../../src/file/time"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"
import { SessionID, MessageID } from "../../src/session/schema"

const ctx = {
  sessionID: SessionID.make("ses_test-edit-pack-hooks"),
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

test("edit calls pack onFileWrite and reports file diagnostics", async () => {
  const hit = mock(async (file: string) => {
    return {
      [file]: [
        {
          severity: 1,
          message: "same file error",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 3 },
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
    const file = path.join(tmp.path, "edit.txt")
    await fs.writeFile(file, "old", "utf-8")

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        PackRegistry.init(["coding"], packs)
        await FileTime.read(ctx.sessionID, file)
        const edit = await EditTool.init()
        const result = await edit.execute({ filePath: file, oldString: "old", newString: "new" }, ctx)
        expect(hit).toHaveBeenCalledTimes(1)
        expect(hit).toHaveBeenCalledWith(file)
        expect(result.metadata.diagnostics[file]).toBeDefined()
        expect(result.output).toContain("LSP errors detected in this file")
      },
    })
  } finally {
    packs.splice(packs.indexOf(hook), 1)
  }
})
