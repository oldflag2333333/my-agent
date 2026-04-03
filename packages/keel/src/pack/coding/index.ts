import { Format } from "@/format"
import { LSP } from "@/lsp"
import { Vcs } from "@/project/vcs"
import { ApplyPatchTool } from "@/tool/apply_patch"
import { BashTool } from "@/tool/bash"
import { BatchTool } from "@/tool/batch"
import { CodeSearchTool } from "@/tool/codesearch"
import { LspTool } from "@/tool/lsp"
import { PlanExitTool } from "@/tool/plan"
import { Flag } from "@/flag/flag"
import type { Pack } from "../pack"
import { codingAgents } from "./agents"

import CODING_CONTEXT from "./prompt/coding-context.txt"

import { codingTui } from "./tui"

export const codingPack: Pack = {
  id: "coding",
  agents: codingAgents,
  tui: codingTui,
  instructions: ["AGENTS.md", ...(Flag.KEEL_DISABLE_CLAUDE_CODE_PROMPT ? [] : ["CLAUDE.md"]), "CONTEXT.md"],
  tools: [
    BashTool,
    CodeSearchTool,
    ApplyPatchTool,
    ...(Flag.KEEL_EXPERIMENTAL_LSP_TOOL ? [LspTool] : []),
    BatchTool,
    ...(Flag.KEEL_EXPERIMENTAL_PLAN_MODE && Flag.KEEL_CLIENT === "cli" ? [PlanExitTool] : []),
  ],
  prompts: [CODING_CONTEXT],
  bootstrap: async () => {
    await Format.init()
    await LSP.init()
    await Vcs.init()
  },
  onFileWrite: async (filepath) => {
    await Format.file(filepath)
    await LSP.touchFile(filepath, true)
    return LSP.diagnostics()
  },
}
