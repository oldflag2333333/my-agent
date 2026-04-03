import { afterEach, expect, test } from "bun:test"
import fs from "fs/promises"
import path from "path"
import { packs } from "../../src/pack"
import { Instance } from "../../src/project/instance"
import { InstructionPrompt } from "../../src/session/instruction"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("keeps coding instruction filenames active through registry defaults", async () => {
  await using tmp = await tmpdir({
    config: { packs: ["coding"] },
    init: async (dir) => {
      await Bun.write(path.join(dir, "AGENTS.md"), "# Root Instructions")
    },
  })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const system = await InstructionPrompt.systemPaths()
      expect(system.has(path.join(tmp.path, "AGENTS.md"))).toBe(true)
    },
  })
})

test("uses pack-contributed instruction filenames without coding defaults", async () => {
  const list = [{ id: "docs", instructions: ["GUIDE.md"] }]
  packs.push(...list)

  try {
    await using tmp = await tmpdir({
      config: { packs: ["docs"] },
      init: async (dir) => {
        await fs.mkdir(path.join(dir, "src", "deep"), { recursive: true })
        await Bun.write(path.join(dir, "AGENTS.md"), "# Ignored")
        await Bun.write(path.join(dir, "GUIDE.md"), "# Root Guide")
        await Bun.write(path.join(dir, "src", "GUIDE.md"), "# Nested Guide")
        await Bun.write(path.join(dir, "src", "deep", "file.ts"), "const x = 1")
      },
    })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const system = await InstructionPrompt.systemPaths()
        expect(system.has(path.join(tmp.path, "GUIDE.md"))).toBe(true)
        expect(system.has(path.join(tmp.path, "AGENTS.md"))).toBe(false)

        const found = await InstructionPrompt.find(path.join(tmp.path, "src"))
        expect(found).toBe(path.join(tmp.path, "src", "GUIDE.md"))

        const resolved = await InstructionPrompt.resolve([], path.join(tmp.path, "src", "deep", "file.ts"), "msg")
        expect(resolved).toEqual([
          {
            filepath: path.join(tmp.path, "src", "GUIDE.md"),
            content: `Instructions from: ${path.join(tmp.path, "src", "GUIDE.md")}\n# Nested Guide`,
          },
        ])
      },
    })
  } finally {
    packs.splice(-list.length, list.length)
  }
})
