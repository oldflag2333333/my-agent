import type { Tool } from "@/tool/tool"
import type { Agent } from "@/agent/agent"

export type AgentContribution = Agent.Info
export type ToolContribution = Tool.Info
export type PromptContribution = string
export type TuiContribution = unknown
export type BootstrapHook = () => Promise<void> | void
export type FileDiagnostic = {
  severity?: number
  message: string
  range: {
    start: {
      line: number
      character: number
    }
    end: {
      line: number
      character: number
    }
  }
}
export type FileDiagnostics = Record<string, FileDiagnostic[]>
export type FileWriteHook = (filepath: string) => Promise<void | FileDiagnostics> | void | FileDiagnostics

export type Pack = {
  id: string
  agents?: AgentContribution[]
  tools?: ToolContribution[]
  prompts?: PromptContribution[]
  instructions?: string[]
  bootstrap?: BootstrapHook
  onFileWrite?: FileWriteHook
  tui?: TuiContribution[]
}
