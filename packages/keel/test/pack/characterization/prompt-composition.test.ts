import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes prompt composition order snapshot", async () => {
  const src = await fs.readFile(new URL("../../../src/session/prompt.ts", import.meta.url), "utf8")
  const system = await fs.readFile(new URL("../../../src/session/system.ts", import.meta.url), "utf8")

  expect(src).toContain(`const [skills, env, packs, instructions, modelMsgs] = yield* Effect.promise(() =>
                  Promise.all([
                    SystemPrompt.skills(agent),
                    SystemPrompt.environment(model),
                    SystemPrompt.packFragments(),
                    InstructionPrompt.system(),
                    MessageV2.toModelMessages(msgs, model),
                  ]),
                )`)

  expect(src).toContain(`const system = SystemPrompt.compose({ env, packs, skills, instructions })`)
  expect(system).toContain(
    `return [...input.env, ...input.packs, ...(input.skills ? [input.skills] : []), ...input.instructions]`,
  )
})
