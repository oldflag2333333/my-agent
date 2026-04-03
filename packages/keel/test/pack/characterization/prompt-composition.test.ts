import { expect, test } from "bun:test"
import fs from "fs/promises"

test("freezes prompt composition order snapshot", async () => {
  const src = await fs.readFile(new URL("../../../src/session/prompt.ts", import.meta.url), "utf8")

  expect(src).toContain(`const [skills, env, instructions, modelMsgs] = yield* Effect.promise(() =>
                  Promise.all([
                    SystemPrompt.skills(agent),
                    SystemPrompt.environment(model),
                    InstructionPrompt.system(),
                    MessageV2.toModelMessages(msgs, model),
                  ]),
                )`)

  expect(src).toContain(`const system = [...env, ...(skills ? [skills] : []), ...instructions]`)
})
