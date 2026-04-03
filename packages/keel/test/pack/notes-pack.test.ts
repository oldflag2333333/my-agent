import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { notesPack } from "../../src/pack/notes"
import { PackRegistry } from "../../src/pack/registry"

const log = "../../.sisyphus/evidence/task-12-notes-pack.log"

async function write(data: unknown) {
  const text = `${JSON.stringify(data, null, 2)}\n`
  const prev = await Bun.file(log)
    .text()
    .catch(() => "")
  await Bun.write(log, prev + text)
}

afterEach(async () => {
  PackRegistry.init([], [])
})

test("notes pack registers minimal notes-only contributions", async () => {
  PackRegistry.init(["notes"], [notesPack])

  const agents = await PackRegistry.agents()
  const prompts = await PackRegistry.prompts()
  const instructions = await PackRegistry.instructions()
  const names = agents.map((item) => item.name)

  expect(names).toContain("notes")
  expect(names).not.toContain("build")
  expect(names).not.toContain("plan")
  expect(names).not.toContain("explore")
  expect(prompts.some((item) => item.trim().length > 0)).toBeTrue()
  expect(instructions).toEqual(["NOTES.md"])

  await write({
    agents: names,
    prompts,
    instructions,
  })
})
