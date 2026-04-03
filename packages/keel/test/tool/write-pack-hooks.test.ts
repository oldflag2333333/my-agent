import { afterEach, expect, mock, test } from "bun:test"
import path from "path"
import { WriteTool } from "../../src/tool/write"
import { packs } from "../../src/pack"
import { PackRegistry } from "../../src/pack"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"
import { SessionID, MessageID } from "../../src/session/schema"

const ctx = {
  sessionID: SessionID.make("ses_test-write-pack-hooks"),
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

test("write calls pack onFileWrite and reports diagnostics", async () => {
  const hit = mock(async () => {
    return {
      "/tmp/other.ts": [
        {
          severity: 1,
          message: "other error",
          range: {
            start: { line: 2, character: 1 },
            end: { line: 2, character: 3 },
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
    const file = path.join(tmp.path, "note.txt")

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        PackRegistry.init(["coding"], packs)
        const write = await WriteTool.init()
        const result = await write.execute({ filePath: file, content: "hello" }, ctx)
        expect(hit).toHaveBeenCalledTimes(1)
        expect(hit).toHaveBeenCalledWith(file)
        expect(result.metadata.diagnostics["/tmp/other.ts"]).toBeDefined()
        expect(result.output).toContain("LSP errors detected in other files")
      },
    })
  } finally {
    packs.splice(packs.indexOf(hook), 1)
  }
})
