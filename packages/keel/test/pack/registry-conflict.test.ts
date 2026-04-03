import { expect, test } from "bun:test"
import { Cause, Effect } from "effect"
import { PackRegistry } from "../../src/pack"

test("rejects duplicate pack ids with clear error", async () => {
  const out = await Effect.runPromiseExit(
    PackRegistry.resolve(
      ["coding", "coding"],
      [
        {
          id: "coding",
        },
      ],
    ),
  )

  if (out._tag !== "Failure") {
    throw new Error("expected failure")
  }

  const err = Cause.squash(out.cause)
  expect(err).toBeInstanceOf(PackRegistry.DuplicatePackError)
  if (!(err instanceof Error)) {
    throw new Error("expected error")
  }
  expect(err.message).toContain("duplicate pack id: coding")
})
