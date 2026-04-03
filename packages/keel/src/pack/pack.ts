import type { Tool } from "@/tool/tool"

export type AgentContribution = unknown
export type ToolContribution = Tool.Info
export type PromptContribution = string
export type TuiContribution = unknown
export type BootstrapHook = () => Promise<void> | void

export type Pack = {
  id: string
  agents?: AgentContribution[]
  tools?: ToolContribution[]
  prompts?: PromptContribution[]
  instructions?: string[]
  bootstrap?: BootstrapHook
  tui?: TuiContribution[]
}
