import { expect, test } from "bun:test"
import z from "zod"
import { Effect } from "effect"
import { PackRegistry } from "../../src/pack"
import type { Pack } from "../../src/pack"
import { Tool } from "../../src/tool/tool"

test("resolves packs in deterministic config order", async () => {
  const tool = (id: string) =>
    Tool.define(id, {
      description: id,
      parameters: z.object({}),
      execute: async () => ({ title: id, output: id, metadata: {} }),
    })
  const a: Pack = {
    id: "a",
    agents: [
      {
        name: "agent:a",
        mode: "subagent",
        permission: [],
        options: {},
      },
    ],
    tools: [tool("tool:a")],
    prompts: ["prompt:a"],
    instructions: ["A.md"],
    bootstrap: () => {},
    onFileWrite: async (filepath) => ({
      [filepath]: [
        {
          severity: 1,
          message: "a",
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
        },
      ],
    }),
    tui: ["tui:a"],
  }
  const b: Pack = {
    id: "b",
    agents: [
      {
        name: "agent:b",
        mode: "subagent",
        permission: [],
        options: {},
      },
    ],
    tools: [tool("tool:b")],
    prompts: ["prompt:b"],
    instructions: ["B.md"],
    bootstrap: () => {},
    onFileWrite: async (filepath) => ({
      [filepath]: [
        {
          severity: 2,
          message: "b",
          range: {
            start: { line: 1, character: 0 },
            end: { line: 1, character: 1 },
          },
        },
      ],
    }),
    tui: ["tui:b"],
  }

  const ids = ["b", "a"]
  const packs: Pack[] = [a, b]

  expect(await Effect.runPromise(PackRegistry.resolve(ids, packs))).toEqual([b, a])

  const reg = PackRegistry.layer(["b", "a"], [a, b])
  const list = await Effect.runPromise(PackRegistry.Service.use((svc) => svc.list()).pipe(Effect.provide(reg)))
  const agents = await Effect.runPromise(PackRegistry.Service.use((svc) => svc.agents()).pipe(Effect.provide(reg)))
  const tools = await Effect.runPromise(PackRegistry.Service.use((svc) => svc.tools()).pipe(Effect.provide(reg)))
  const prompts = await Effect.runPromise(PackRegistry.Service.use((svc) => svc.prompts()).pipe(Effect.provide(reg)))
  const instructions = await Effect.runPromise(
    PackRegistry.Service.use((svc) => svc.instructions()).pipe(Effect.provide(reg)),
  )
  const bootstraps = await Effect.runPromise(
    PackRegistry.Service.use((svc) => svc.bootstraps()).pipe(Effect.provide(reg)),
  )
  const tui = await Effect.runPromise(PackRegistry.Service.use((svc) => svc.tui()).pipe(Effect.provide(reg)))
  const fileWrites = await Effect.runPromise(
    PackRegistry.Service.use((svc) => svc.fileWrites()).pipe(Effect.provide(reg)),
  )
  PackRegistry.init(ids, packs)
  const diagnostics = await PackRegistry.onFileWrite("/tmp/file.ts")

  expect(list.map((pack) => pack.id)).toEqual(["b", "a"])
  expect(agents.map((item) => item.name)).toEqual(["agent:b", "agent:a"])
  expect(tools.map((item) => item.id)).toEqual(["tool:b", "tool:a"])
  expect(prompts).toEqual(["prompt:b", "prompt:a"])
  expect(instructions).toEqual(["B.md", "A.md"])
  expect(bootstraps).toEqual([b.bootstrap!, a.bootstrap!])
  expect(fileWrites).toEqual([b.onFileWrite!, a.onFileWrite!])
  expect(diagnostics["/tmp/file.ts"]?.map((item) => item.message)).toEqual(["b", "a"])
  expect(tui).toEqual(["tui:b", "tui:a"])
})
