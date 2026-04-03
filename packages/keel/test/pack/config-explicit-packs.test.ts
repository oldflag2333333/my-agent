import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { Config } from "../../src/config/config"
import { codingPack, notesPack, packs } from "../../src/pack"
import { PackRegistry } from "../../src/pack/registry"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

const log = "../../.sisyphus/evidence/task-13-migration-explicit.log"

async function write(data: unknown) {
  const text = `${JSON.stringify(data, null, 2)}\n`
  const prev = await Bun.file(log)
    .text()
    .catch(() => "")
  await Bun.write(log, prev + text)
}

afterEach(async () => {
  PackRegistry.init([], packs)
  await Instance.disposeAll()
})

test("explicit empty packs keeps core-only config value", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const cfg = await Config.get()
      expect(cfg.packs).toEqual([])

      await write({
        case: "empty",
        packs: cfg.packs,
      })
    },
  })
})

test("explicit mixed packs loads coding and notes packs", async () => {
  await using tmp = await tmpdir({ config: { packs: ["coding", "notes"] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const cfg = await Config.get()
      expect(cfg.packs).toEqual(["coding", "notes"])

      PackRegistry.init(cfg.packs, [codingPack, notesPack])
      const names = (await PackRegistry.agents()).map((item) => item.name)
      expect(names).toContain("build")
      expect(names).toContain("notes")

      await write({
        case: "mixed",
        packs: cfg.packs,
        agents: names,
      })
    },
  })
})
