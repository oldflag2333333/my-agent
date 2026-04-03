import { afterEach, expect, test } from "bun:test"
import path from "path"
import { packs } from "../../src/pack"
import { Instance } from "../../src/project/instance"
import { InstructionPrompt } from "../../src/session/instruction"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("notes-style packs do not inherit coding instruction files", async () => {
  const list = [{ id: "notes-test", instructions: ["NOTES.md"] }]
  packs.push(...list)

  try {
    await using tmp = await tmpdir({
      config: { packs: ["notes-test"] },
      init: async (dir) => {
        await Bun.write(path.join(dir, "NOTES.md"), "# Notes")
        await Bun.write(path.join(dir, "AGENTS.md"), "# Agents")
      },
    })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const system = await InstructionPrompt.systemPaths()
        expect(system.has(path.join(tmp.path, "NOTES.md"))).toBe(true)
        expect(system.has(path.join(tmp.path, "AGENTS.md"))).toBe(false)
        expect(await InstructionPrompt.find(tmp.path)).toBe(path.join(tmp.path, "NOTES.md"))
      },
    })
  } finally {
    packs.splice(-list.length, list.length)
  }
})
