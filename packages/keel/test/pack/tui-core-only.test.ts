import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { PackRegistry } from "@/pack/registry"
import { packs } from "@/pack"
import fs from "fs/promises"

afterEach(() => {
  PackRegistry.init([], packs)
})

test("tui core only includes no tui contributions", async () => {
  PackRegistry.init([], packs)
  const tui = await PackRegistry.tui()
  expect(tui.length).toBe(0)

  await fs.writeFile("../../.sisyphus/evidence/task-11-tui-core-only.log", "tui core only")
})
