import { afterEach, expect, test } from "bun:test"
import path from "path"
import { Skill } from "../../src/skill"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("coding pack keeps .claude and .agents skill dirs active", async () => {
  await using tmp = await tmpdir({
    git: true,
    config: { packs: ["coding"] },
    init: async (dir) => {
      await Bun.write(
        path.join(dir, ".claude", "skills", "claude-pack", "SKILL.md"),
        `---
name: claude-pack
description: Claude pack skill.
---

# Claude Pack
`,
      )
      await Bun.write(
        path.join(dir, ".agents", "skills", "agent-pack", "SKILL.md"),
        `---
name: agent-pack
description: Agent pack skill.
---

# Agent Pack
`,
      )
    },
  })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const all = await Skill.all()
      const dirs = await Skill.dirs()

      expect(all.map((item) => item.name).toSorted()).toEqual(["agent-pack", "claude-pack"])
      expect(dirs).toContain(path.join(tmp.path, ".claude", "skills", "claude-pack"))
      expect(dirs).toContain(path.join(tmp.path, ".agents", "skills", "agent-pack"))
    },
  })
})

test("core-only mode skips coding skill dirs", async () => {
  await using tmp = await tmpdir({
    git: true,
    config: { packs: [] },
    init: async (dir) => {
      await Bun.write(
        path.join(dir, ".claude", "skills", "claude-pack", "SKILL.md"),
        `---
name: claude-pack
description: Claude pack skill.
---

# Claude Pack
`,
      )
      await Bun.write(
        path.join(dir, ".agents", "skills", "agent-pack", "SKILL.md"),
        `---
name: agent-pack
description: Agent pack skill.
---

# Agent Pack
`,
      )
    },
  })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      expect(await Skill.all()).toEqual([])
      expect(await Skill.dirs()).toEqual([])
    },
  })
})
