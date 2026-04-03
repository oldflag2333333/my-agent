import type { Agent } from "@/agent/agent"
import { Permission } from "@/permission"

export const notesAgent: Agent.Info = {
  name: "notes",
  description: "Primary agent for working with notes in the current workspace.",
  prompt:
    "You are a notes-library workspace assistant. Help read, organize, and update notes using generic workspace tools.",
  permission: Permission.fromConfig({
    question: "allow",
    bash: "deny",
    codesearch: "deny",
    lsp: "deny",
  }),
  options: {},
  mode: "primary",
  native: true,
}
