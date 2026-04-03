import { EditTool } from "@/tool/edit"
import { GlobTool } from "@/tool/glob"
import { GrepTool } from "@/tool/grep"
import { QuestionTool } from "@/tool/question"
import { ReadTool } from "@/tool/read"
import { TaskTool } from "@/tool/task"
import { TodoWriteTool } from "@/tool/todo"
import { WebFetchTool } from "@/tool/webfetch"
import { WebSearchTool } from "@/tool/websearch"
import { WriteTool } from "@/tool/write"
import type { Pack } from "../pack"
import { notesAgent } from "./agent"

export * from "./agent"

export const notesPack: Pack = {
  id: "notes",
  agents: [notesAgent],
  tools: [
    ReadTool,
    WriteTool,
    EditTool,
    GlobTool,
    GrepTool,
    QuestionTool,
    TaskTool,
    TodoWriteTool,
    WebFetchTool,
    WebSearchTool,
  ],
  prompts: ["You are a notes-library workspace assistant."],
  instructions: ["NOTES.md"],
}
