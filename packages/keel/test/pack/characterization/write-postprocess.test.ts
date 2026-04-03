import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes write post-process snapshot for format and lsp order", async () => {
  const src = await fs.readFile(new URL("../../../src/tool/write.ts", import.meta.url), "utf8")

  expect(src).toContain(`    await Filesystem.write(filepath, params.content)
    await Format.file(filepath)`)

  expect(src).toContain(`    await LSP.touchFile(filepath, true)
    const diagnostics = await LSP.diagnostics()`)
})
