import { afterEach, expect, mock, spyOn, test } from "bun:test"
import { Format } from "../../src/format"
import { LSP } from "../../src/lsp"
import { InstanceBootstrap } from "../../src/project/bootstrap"
import { Instance } from "../../src/project/instance"
import { Vcs } from "../../src/project/vcs"
import { Log } from "../../src/util/log"
import { tmpdir } from "../fixture/fixture"

Log.init({ print: false })

afterEach(async () => {
  await Instance.disposeAll()
  mock.restore()
})

test("default packs bootstrap coding lifecycle", async () => {
  const format = spyOn(Format, "init").mockResolvedValue()
  const lsp = spyOn(LSP, "init").mockResolvedValue()
  const vcs = spyOn(Vcs, "init").mockResolvedValue()

  await using tmp = await tmpdir({ git: true })
  await Instance.provide({
    directory: tmp.path,
    init: InstanceBootstrap,
    fn: async () => undefined,
  })

  expect(format).toHaveBeenCalledTimes(1)
  expect(lsp).toHaveBeenCalledTimes(1)
  expect(vcs).toHaveBeenCalledTimes(1)
})
