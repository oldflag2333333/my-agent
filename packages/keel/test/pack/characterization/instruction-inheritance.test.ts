import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes instruction filename inheritance snapshot", async () => {
  const src = await fs.readFile(new URL("../../../src/session/instruction.ts", import.meta.url), "utf8")

  expect(src).toContain(`const FILES = [
  "AGENTS.md",
  ...(Flag.KEEL_DISABLE_CLAUDE_CODE_PROMPT ? [] : ["CLAUDE.md"]),
  "CONTEXT.md", // deprecated
]`)
})
