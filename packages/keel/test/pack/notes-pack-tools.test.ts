import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { notesPack } from "../../src/pack/notes"
import { PackRegistry } from "../../src/pack/registry"

const log = "../../.sisyphus/evidence/task-12-notes-pack-tools.log"

async function write(data: unknown) {
  const text = `${JSON.stringify(data, null, 2)}\n`
  const prev = await Bun.file(log)
    .text()
    .catch(() => "")
  await Bun.write(log, prev + text)
}

afterEach(async () => {
  PackRegistry.init([], [])
})

test("notes pack exposes only core-safe generic tools", async () => {
  PackRegistry.init(["notes"], [notesPack])

  const tools = await PackRegistry.tools()
  const ids = tools.map((item) => item.id)

  expect(ids).not.toContain("bash")
  expect(ids).not.toContain("lsp")
  expect(ids).not.toContain("codesearch")
  expect(ids).not.toContain("apply_patch")
  expect(ids).toContain("read")
  expect(ids).toContain("write")
  expect(ids).toContain("edit")
  expect(ids).toContain("glob")

  await write({
    tools: ids,
  })
})
