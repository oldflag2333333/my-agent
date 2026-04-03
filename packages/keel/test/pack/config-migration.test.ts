import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { Config } from "../../src/config/config"
import { packs } from "../../src/pack"
import { PackRegistry } from "../../src/pack/registry"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

const log = "../../.sisyphus/evidence/task-13-migration.log"

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

test("legacy config without packs key resolves to coding default", async () => {
  await using tmp = await tmpdir({ config: {} })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      const cfg = await Config.get()
      expect(cfg.packs).toEqual(["coding"])

      PackRegistry.init(cfg.packs, packs)
      const names = (await PackRegistry.agents()).map((item) => item.name)
      expect(names).toContain("build")
      expect(names).toContain("plan")

      await write({
        packs: cfg.packs,
        agents: names,
      })
    },
  })
})
