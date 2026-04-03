import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { codingPack, notesPack, packs } from "../../../src/pack"
import { PackRegistry } from "../../../src/pack/registry"
import { Instance } from "../../../src/project/instance"

const log = "../../.sisyphus/evidence/task-14-integration-matrix.log"

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

test("mixed coding and notes packs merge in configured order", async () => {
  PackRegistry.init(["coding", "notes"], [codingPack, notesPack])

  const agents = await PackRegistry.agents()
  const tools = await PackRegistry.tools()
  const prompts = await PackRegistry.prompts()
  const instructions = await PackRegistry.instructions()
  const names = agents.map((item) => item.name)
  const ids = tools.map((item) => item.id)

  expect(names).toContain("build")
  expect(names).toContain("notes")
  expect(names.indexOf("build")).toBeLessThan(names.indexOf("notes"))

  expect(ids).toContain("bash")
  expect(ids).toContain("apply_patch")
  expect(ids).toContain("codesearch")
  expect(ids).toContain("read")
  expect(ids).toContain("write")
  expect(ids).toContain("edit")
  expect(ids).toContain("glob")
  expect(new Set(ids).size).toBe(ids.length)

  expect(prompts.length).toBeGreaterThan(1)
  const coding = codingPack.prompts?.[0]
  const notes = notesPack.prompts?.[0]
  if (!coding || !notes) {
    throw new Error("expected pack prompts")
  }
  expect(prompts).toContain(coding)
  expect(prompts).toContain(notes)

  expect(instructions).toContain("AGENTS.md")
  expect(instructions).toContain("NOTES.md")
  expect(instructions.indexOf("AGENTS.md")).toBeLessThan(instructions.indexOf("NOTES.md"))

  PackRegistry.init(["notes"], [notesPack])
  const only = await PackRegistry.instructions()
  expect(only).toEqual(["NOTES.md"])
  expect(only).not.toContain("AGENTS.md")

  await write({
    agents: names,
    tools: ids,
    prompts,
    instructions,
    notes_only_instructions: only,
  })
})
