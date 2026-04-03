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

export const codingPack: Pack = {
  id: "coding",
  tools: [
    BashTool,
    CodeSearchTool,
    ApplyPatchTool,
    ...(Flag.KEEL_EXPERIMENTAL_LSP_TOOL ? [LspTool] : []),
    BatchTool,
    ...(Flag.KEEL_EXPERIMENTAL_PLAN_MODE && Flag.KEEL_CLIENT === "cli" ? [PlanExitTool] : []),
  ],
  bootstrap: async () => {
    await Format.init()
    await LSP.init()
    await Vcs.init()
  },
}
