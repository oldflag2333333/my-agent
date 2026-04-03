import { afterEach, describe, expect, test } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { tmpdir } from "../fixture/fixture"
import { Instance } from "../../src/project/instance"
import { ToolRegistry } from "../../src/tool/registry"

afterEach(async () => {
  await Instance.disposeAll()
})

describe("tool.registry", () => {
  test("loads tools from .keel/tool (singular)", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        const keelDir = path.join(dir, ".keel")
        await fs.mkdir(keelDir, { recursive: true })

        const toolDir = path.join(keelDir, "tool")
        await fs.mkdir(toolDir, { recursive: true })

        await Bun.write(
          path.join(toolDir, "hello.ts"),
          [
            "export default {",
            "  description: 'hello tool',",
            "  args: {},",
            "  execute: async () => {",
            "    return 'hello world'",
            "  },",
            "}",
            "",
          ].join("\n"),
        )
      },
    })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const ids = await ToolRegistry.ids()
        expect(ids).toContain("hello")
      },
    })
  })

  test("loads tools from .keel/tools (plural)", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        const keelDir = path.join(dir, ".keel")
        await fs.mkdir(keelDir, { recursive: true })

        const toolsDir = path.join(keelDir, "tools")
        await fs.mkdir(toolsDir, { recursive: true })

        await Bun.write(
          path.join(toolsDir, "hello.ts"),
          [
            "export default {",
            "  description: 'hello tool',",
            "  args: {},",
            "  execute: async () => {",
            "    return 'hello world'",
            "  },",
            "}",
            "",
          ].join("\n"),
        )
      },
    })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const ids = await ToolRegistry.ids()
        expect(ids).toContain("hello")
      },
    })
  })

  test("loads tools with external dependencies without crashing", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        const keelDir = path.join(dir, ".keel")
        await fs.mkdir(keelDir, { recursive: true })

        const toolsDir = path.join(keelDir, "tools")
        await fs.mkdir(toolsDir, { recursive: true })

        await Bun.write(
          path.join(keelDir, "package.json"),
          JSON.stringify({
            name: "custom-tools",
            dependencies: {
              "@keel-ai/plugin": "^0.0.0",
            },
          }),
        )

        const cowsayDir = path.join(keelDir, "node_modules", "cowsay")
        await fs.mkdir(cowsayDir, { recursive: true })
        await Bun.write(path.join(cowsayDir, "package.json"), JSON.stringify({ name: "cowsay", type: "module" }))
        await Bun.write(path.join(cowsayDir, "index.js"), "export function say({ text }) { return text }\n")

        await Bun.write(
          path.join(toolsDir, "cowsay.ts"),
          [
            "import { say } from 'cowsay'",
            "export default {",
            "  description: 'tool that imports cowsay at top level',",
            "  args: { text: { type: 'string' } },",
            "  execute: async ({ text }: { text: string }) => {",
            "    return say({ text })",
            "  },",
            "}",
            "",
          ].join("\n"),
        )
      },
    })

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const ids = await ToolRegistry.ids()
        expect(ids).toContain("cowsay")
      },
    })
  })
})
