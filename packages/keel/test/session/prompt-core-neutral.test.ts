import { afterEach, expect, test } from "bun:test"
import { Instance } from "../../src/project/instance"
import { SystemPrompt } from "../../src/session/system"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

const codingTerms = [
  "software engineering",
  "codebase",
  "repository",
  "lsp",
  "lint",
  "typecheck",
  "programming",
  "refactoring",
  "debugging",
  "npm run",
  "package.json",
  "cargo.toml",
  "requirements.txt",
  "build.gradle",
  "best coding agent",
  "AGENTS.md",
]

test("core prompt without coding pack is domain-neutral", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const model = {
        id: "test-model",
        providerID: "test-provider",
        api: { id: "test-model" },
      } as any

      const base = SystemPrompt.base(model)
      const env = await SystemPrompt.environment(model)
      const packs = await SystemPrompt.packFragments()
      const composed = SystemPrompt.compose({
        env,
        packs,
        instructions: [],
      })

      const fullPrompt = [...base, ...composed].join(" ").toLowerCase()

      for (const term of codingTerms) {
        expect(fullPrompt).not.toContain(term.toLowerCase())
      }
    },
  })
})

test("coding pack adds coding context when loaded", async () => {
  await using tmp = await tmpdir({ config: { packs: ["coding"] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const model = {
        id: "test-model",
        providerID: "test-provider",
        api: { id: "test-model" },
      } as any

      const packs = await SystemPrompt.packFragments()
      const fullPrompt = packs.join(" ").toLowerCase()

      expect(packs.length).toBeGreaterThan(0)
      expect(fullPrompt).toContain("software engineering")
    },
  })
})
