import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes default tool roster snapshot from registry", async () => {
  const src = await fs.readFile(new URL("../../../src/tool/registry.ts", import.meta.url), "utf8")

  expect(src).toContain(`return [
          InvalidTool,
          ...(question ? [QuestionTool] : []),
          ...bash,
          ReadTool,
          GlobTool,
          GrepTool,
          EditTool,
          WriteTool,
          TaskTool,
          WebFetchTool,
          TodoWriteTool,
          WebSearchTool,
          ...code,
          SkillTool,
          ...tail,
          ...custom,
        ]`)
})
