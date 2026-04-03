import "@opentui/solid/preload"
import { afterEach, expect, test } from "bun:test"
import { PackRegistry, packs } from "../../../src/pack"
import { Instance } from "../../../src/project/instance"

const log = "../../.sisyphus/evidence/task-14-integration-conflicts.log"

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

test("duplicate pack ids fail fast and keep state consistent", async () => {
  PackRegistry.init(["coding", "coding"], packs)

  const err = await PackRegistry.agents().catch((item) => item)
  expect(err).toBeInstanceOf(PackRegistry.DuplicatePackError)
  if (!(err instanceof Error)) {
    throw new Error("expected error")
  }
  expect(err.message).toBe("duplicate pack id: coding")

  const tool_err = await PackRegistry.tools().catch((item) => item)
  expect(tool_err).toBeInstanceOf(PackRegistry.DuplicatePackError)

  PackRegistry.init([], packs)
  const agents = await PackRegistry.agents()
  const tools = await PackRegistry.tools()
  expect(agents).toEqual([])
  expect(tools).toEqual([])

  await write({
    error_name: err.name,
    error_message: err.message,
    tool_error_name: tool_err instanceof Error ? tool_err.name : "unknown",
    agents,
    tools,
  })
})
