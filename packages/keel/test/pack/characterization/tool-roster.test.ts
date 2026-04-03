import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes default tool roster snapshot from registry", async () => {
  const src = await fs.readFile(new URL("../../../src/tool/registry.ts", import.meta.url), "utf8")

  expect(src).toContain(`return [
          InvalidTool,
          ...(question ? [QuestionTool] : []),
          BashTool,
          ReadTool,
          GlobTool,
          GrepTool,
          EditTool,
          WriteTool,
          TaskTool,
          WebFetchTool,
          TodoWriteTool,
          WebSearchTool,
          CodeSearchTool,
          SkillTool,
          ApplyPatchTool,
          ...(Flag.KEEL_EXPERIMENTAL_LSP_TOOL ? [LspTool] : []),
          ...(cfg.experimental?.batch_tool === true ? [BatchTool] : []),
          ...(Flag.KEEL_EXPERIMENTAL_PLAN_MODE && Flag.KEEL_CLIENT === "cli" ? [PlanExitTool] : []),
          ...custom,
        ]`)
})
