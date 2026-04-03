import { afterEach, expect, test } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { WriteTool } from "../../src/tool/write"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"
import { SessionID, MessageID } from "../../src/session/schema"

const ctx = {
  sessionID: SessionID.make("ses_test-write-core-only"),
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
})

test("write succeeds with no packs and no diagnostics", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })
  const file = path.join(tmp.path, "core.txt")

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const write = await WriteTool.init()
      const result = await write.execute({ filePath: file, content: "core" }, ctx)
      expect(result.output).toContain("Wrote file successfully")
      expect(result.metadata.diagnostics).toEqual({})
      expect(await fs.readFile(file, "utf-8")).toBe("core")
    },
  })
})
