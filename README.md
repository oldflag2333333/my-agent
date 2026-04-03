# Keel

The open source AI coding agent.

[![Discord](https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord)](https://keel.ai/discord)

## About

Keel is a TUI-based AI coding agent. This repo is a foundation for building TUI-agent products. It provides the core agent runtime, plugin system, and SDKs needed to build AI-powered terminal applications.

## Packages

This monorepo contains the following packages:

| Package           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `packages/keel`   | Core agent runtime and TUI interface           |
| `packages/plugin` | Plugin system for extending agent capabilities |
| `packages/script` | Build and utility scripts                      |
| `packages/sdk/js` | JavaScript/TypeScript SDK for integrations     |
| `packages/util`   | Shared utility libraries                       |

## Installation

```bash
npm i -g @keel-ai/cli@latest
```

Or use any package manager (bun, pnpm, yarn).

## Quick Start

```bash
# Start Keel TUI in current directory
keel

# Start in a specific directory
keel /path/to/project

# Start headless API server
keel serve
```

## Agents

Keel includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

## Documentation

Learn more at [keel.ai/docs](https://keel.ai/docs).

## Contributing

Read our [contributing guidelines](./CONTRIBUTING.md) before submitting a pull request.

## Building on Keel

If you are working on a project that uses "keel" as part of its name (for example, "keel-dashboard"), please add a note to your README clarifying it is not built by the Keel team and is not affiliated with us.

## FAQ

**How is this different from Claude Code?**

- 100% open source
- Provider-agnostic. Works with Claude, OpenAI, Google, or local models
- Out-of-the-box LSP support
- TUI-first design built with opentui

---

[Discord](https://discord.gg/keel)
