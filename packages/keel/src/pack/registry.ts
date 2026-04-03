import { Effect, Layer, Schema, ServiceMap } from "effect"
import type { BootstrapHook, Pack, PromptContribution } from "./pack"
import type { Tool } from "@/tool/tool"

export namespace PackRegistry {
  export class DuplicatePackError extends Schema.TaggedErrorClass<DuplicatePackError>()("DuplicatePackError", {
    id: Schema.String,
  }) {
    override get message() {
      return `duplicate pack id: ${this.id}`
    }
  }

  export interface Interface {
    readonly list: () => Effect.Effect<Pack[]>
    readonly agents: () => Effect.Effect<unknown[]>
    readonly tools: () => Effect.Effect<Tool.Info[]>
    readonly prompts: () => Effect.Effect<PromptContribution[]>
    readonly instructions: () => Effect.Effect<string[]>
    readonly bootstraps: () => Effect.Effect<BootstrapHook[]>
    readonly tui: () => Effect.Effect<unknown[]>
  }

  export class Service extends ServiceMap.Service<Service, Interface>()("@keel/PackRegistry") {}

  export const resolve = Effect.fn("PackRegistry.resolve")(function* (ids: string[], list: Pack[]) {
    const map = new Map(list.map((pack) => [pack.id, pack]))
    const seen = new Set<string>()
    const packs: Pack[] = []

    for (const id of ids) {
      if (seen.has(id)) {
        return yield* new DuplicatePackError({ id })
      }
      seen.add(id)
      const hit = map.get(id)
      if (!hit) continue
      packs.push(hit)
    }

    return packs
  })

  export const layer = (ids: string[], list: Pack[]) =>
    Layer.effect(
      Service,
      Effect.gen(function* () {
        const packs = yield* resolve(ids, list)

        const all = Effect.fn("PackRegistry.list")(() => Effect.succeed(packs))
        const agents = Effect.fn("PackRegistry.agents")(() =>
          Effect.succeed(packs.flatMap((pack) => pack.agents ?? [])),
        )
        const tools = Effect.fn("PackRegistry.tools")(() => Effect.succeed(packs.flatMap((pack) => pack.tools ?? [])))
        const prompts = Effect.fn("PackRegistry.prompts")(() =>
          Effect.succeed(packs.flatMap((pack) => pack.prompts ?? [])),
        )
        const instructions = Effect.fn("PackRegistry.instructions")(() =>
          Effect.succeed(packs.flatMap((pack) => pack.instructions ?? [])),
        )
        const bootstraps = Effect.fn("PackRegistry.bootstraps")(() =>
          Effect.succeed(packs.flatMap((pack) => (pack.bootstrap ? [pack.bootstrap] : []))),
        )
        const tui = Effect.fn("PackRegistry.tui")(() => Effect.succeed(packs.flatMap((pack) => pack.tui ?? [])))

        return Service.of({
          list: all,
          agents,
          tools,
          prompts,
          instructions,
          bootstraps,
          tui,
        })
      }),
    )

  export const defaultLayer = layer([], [])

  const state = {
    ready: false,
    ids: [] as string[],
    packs: [] as Pack[],
  }

  export function init(ids: string[], packs: Pack[]) {
    state.ready = true
    state.ids = ids
    state.packs = packs
  }

  export function ready() {
    return state.ready
  }

  export function configured(ids: string[]) {
    return state.ready && state.ids.length === ids.length && state.ids.every((id, i) => id === ids[i])
  }

  const current = Effect.fnUntraced(function* () {
    return yield* resolve(state.ids, state.packs)
  })

  export async function list() {
    return Effect.runPromise(current())
  }

  export async function agents() {
    return Effect.runPromise(current().pipe(Effect.map((packs) => packs.flatMap((pack) => pack.agents ?? []))))
  }

  export async function tools() {
    return Effect.runPromise(current().pipe(Effect.map((packs) => packs.flatMap((pack) => pack.tools ?? []))))
  }

  export async function prompts() {
    return Effect.runPromise(current().pipe(Effect.map((packs) => packs.flatMap((pack) => pack.prompts ?? []))))
  }

  export async function instructions() {
    return Effect.runPromise(current().pipe(Effect.map((packs) => packs.flatMap((pack) => pack.instructions ?? []))))
  }

  export async function bootstraps() {
    return Effect.runPromise(
      current().pipe(Effect.map((packs) => packs.flatMap((pack) => (pack.bootstrap ? [pack.bootstrap] : [])))),
    )
  }

  export async function tui() {
    return Effect.runPromise(current().pipe(Effect.map((packs) => packs.flatMap((pack) => pack.tui ?? []))))
  }
}
