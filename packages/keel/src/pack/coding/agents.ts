import { Permission } from "@/permission"
import PROMPT_EXPLORE from "@/agent/prompt/explore.txt"
import type { Agent } from "@/agent/agent"
import path from "path"
import { Global } from "@/global"

export const codingAgents: Agent.Info[] = [
  {
    name: "build",
    description: "The default agent. Executes tools based on configured permissions.",
    options: {},
    permission: Permission.fromConfig({
      question: "allow",
      plan_enter: "allow",
    }),
    mode: "primary",
    native: true,
  },
  {
    name: "plan",
    description: "Plan mode. Disallows all edit tools.",
    options: {},
    permission: Permission.fromConfig({
      question: "allow",
      plan_exit: "allow",
      external_directory: {
        [path.join(Global.Path.data, "plans", "*")]: "allow",
      },
      edit: {
        "*": "deny",
        [path.join(".keel", "plans", "*.md")]: "allow",
      },
    }),
    mode: "primary",
    native: true,
  },
  {
    name: "explore",
    permission: Permission.fromConfig({
      "*": "deny",
      grep: "allow",
      glob: "allow",
      list: "allow",
      bash: "allow",
      webfetch: "allow",
      websearch: "allow",
      codesearch: "allow",
      read: "allow",
      external_directory: {
        "*": "ask",
      },
    }),
    description:
      'Fast agent specialized for exploring codebases. Use this when you need to quickly find files by patterns (eg. "src/components/**/*.tsx"), search code for keywords (eg. "API endpoints"), or answer questions about the codebase (eg. "how do API endpoints work?"). When calling this agent, specify the desired thoroughness level: "quick" for basic searches, "medium" for moderate exploration, or "very thorough" for comprehensive analysis across multiple locations and naming conventions.',
    prompt: PROMPT_EXPLORE,
    options: {},
    mode: "subagent",
    native: true,
  },
]
