import { afterEach, expect, test } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { EditTool } from "../../src/tool/edit"
import { FileTime } from "../../src/file/time"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"
import { SessionID, MessageID } from "../../src/session/schema"

const ctx = {
  sessionID: SessionID.make("ses_test-edit-core-only"),
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

test("edit succeeds with no packs and no diagnostics", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })
  const file = path.join(tmp.path, "core-edit.txt")
  await fs.writeFile(file, "before", "utf-8")

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      await FileTime.read(ctx.sessionID, file)
      const edit = await EditTool.init()
      const result = await edit.execute({ filePath: file, oldString: "before", newString: "after" }, ctx)
      expect(result.output).toContain("Edit applied successfully")
      expect(result.metadata.diagnostics).toEqual({})
      expect(await fs.readFile(file, "utf-8")).toBe("after")
    },
  })
})
