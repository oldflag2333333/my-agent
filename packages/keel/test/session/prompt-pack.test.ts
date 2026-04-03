import { afterEach, expect, test } from "bun:test"
import { packs } from "../../src/pack"
import { Instance } from "../../src/project/instance"
import { SystemPrompt } from "../../src/session/system"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("assembles pack fragments in configured pack order", async () => {
  const list = [
    { id: "alpha", prompts: ["pack:alpha"] },
    { id: "beta", prompts: ["pack:beta"] },
  ]
  packs.push(...list)

  try {
    await using tmp = await tmpdir({ config: { packs: ["beta", "alpha"] } })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const pack = await SystemPrompt.packFragments()
        expect(pack).toEqual(["pack:beta", "pack:alpha"])
        expect(
          SystemPrompt.compose({
            env: ["env"],
            packs: pack,
            skills: "skills",
            instructions: ["instructions"],
          }),
        ).toEqual(["env", "pack:beta", "pack:alpha", "skills", "instructions"])
      },
    })
  } finally {
    packs.splice(-list.length, list.length)
  }
})

test("keeps coding default assembly unchanged when pack fragments are empty", async () => {
  await using tmp = await tmpdir({ config: { packs: ["coding"] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      expect(await SystemPrompt.packFragments()).toEqual([])
      expect(
        SystemPrompt.compose({
          env: ["env"],
          packs: [],
          skills: "skills",
          instructions: ["instructions"],
        }),
      ).toEqual(["env", "skills", "instructions"])
    },
  })
})
