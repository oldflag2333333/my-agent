import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes write post-process snapshot for format and lsp order", async () => {
  const src = await fs.readFile(new URL("../../../src/tool/write.ts", import.meta.url), "utf8")

  expect(src).toContain(`    await Filesystem.write(filepath, params.content)
    const diagnostics = await PackRegistry.onFileWrite(filepath)`)

  expect(src).not.toContain("Format.file(filepath)")
  expect(src).not.toContain("LSP.touchFile(filepath, true)")
  expect(src).not.toContain("LSP.diagnostics()")
})
