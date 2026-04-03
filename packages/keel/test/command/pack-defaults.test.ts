import { afterEach, expect, test } from "bun:test"
import { Command } from "../../src/command"
import { Instance } from "../../src/project/instance"
import { tmpdir } from "../fixture/fixture"

afterEach(async () => {
  await Instance.disposeAll()
})

test("coding pack keeps init and review defaults", async () => {
  await using tmp = await tmpdir({ config: { packs: ["coding"] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      expect(await Command.get(Command.Default.INIT)).toMatchObject({
        name: Command.Default.INIT,
        source: "command",
      })
      expect(await Command.get(Command.Default.REVIEW)).toMatchObject({
        name: Command.Default.REVIEW,
        source: "command",
        subtask: true,
      })
    },
  })
})

test("core-only mode omits coding default commands", async () => {
  await using tmp = await tmpdir({ config: { packs: [] } })

  await Instance.provide({
    directory: tmp.path,
    fn: async () => {
      expect(await Command.get(Command.Default.INIT)).toBeUndefined()
      expect(await Command.get(Command.Default.REVIEW)).toBeUndefined()
    },
  })
})
