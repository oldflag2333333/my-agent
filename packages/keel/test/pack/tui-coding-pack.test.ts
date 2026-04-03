import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { PackRegistry } from "@/pack/registry"
import { codingPack } from "@/pack/coding"
import { packs } from "@/pack"
import fs from "fs/promises"

afterEach(() => {
  PackRegistry.init([], packs)
})

test("tui coding pack includes coding tui contributions", async () => {
  PackRegistry.init(["coding"], [codingPack])
  const tui = await PackRegistry.tui()
  expect(tui.length).toBeGreaterThan(0)

  await fs.writeFile("../../.sisyphus/evidence/task-11-tui-coding.log", "tui coding contribution exists")
})
