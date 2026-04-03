# @keel-ai/core

The core agent runtime and TUI interface for Keel.

## Overview

This package provides the foundation for AI-powered terminal applications:

- **Agent runtime** — session management, tool execution, permission engine
- **TUI interface** — terminal UI built with opentui
- **Pack system** — capability bundles for domain-specific workflows
- **Plugin API** — extension points for custom tools and UI components

## Pack System

Packs are internal capability bundles that group agents, tools, prompts, and TUI components for specific use cases. They sit above the plugin system and ship with Keel itself.

### Pack Contract

A pack is defined by the `Pack` type in `src/pack/pack.ts`:

```typescript
type Pack = {
  id: string // Unique identifier
  agents?: Agent[] // Agents to register
  tools?: Tool[] // Tools to add
  prompts?: string[] // Prompt fragments to include
  instructions?: string[] // Instruction file patterns
  bootstrap?: () => Promise<void> | void
  onFileWrite?: (filepath: string) => Promise<FileDiagnostics | void> | FileDiagnostics | void
  tui?: unknown[] // TUI component contributions
}
```

Packs load in config order. Duplicate IDs fail fast. Tools and agents from multiple packs merge unless they conflict.

### Built-in Packs

#### `coding-pack`

The default pack for software development.

**Agents:**

- `build` — Full-access primary agent (default)
- `plan` — Read-only primary agent for exploration
- `explore` — Subagent for complex searches

**Tools:**

- `bash` — Execute shell commands
- `apply_patch` — Apply unified diffs
- `codesearch` — Code-aware search
- `lsp` — Language server integration

**Bootstrap:** Initializes Format, LSP, and VCS services.

**File Write Hook:** Runs format, LSP touch, and diagnostics.

**TUI:** Files sidebar, LSP panel, MCP panel, todo panel, coding footer.

**Instructions:** `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`

#### `notes-pack`

Minimal proof-of-concept pack for note-taking workspaces.

**Agents:**

- `notes` — Primary agent with safe tool permissions

**Tools:** Core-safe only (no bash, LSP, code search, or patch)

**Prompts:** Notes assistant identity

**Instructions:** `NOTES.md`

### Configuration

Configure packs in `keel.json`:

```json
{
  "packs": ["coding"]
}
```

The `packs` array accepts ordered pack IDs. Default is `["coding"]`.

For core-only mode (no domain packs):

```json
{
  "packs": []
}
```

### Adding a New Pack

1. Create a new directory under `src/pack/{name}/`
2. Export a pack object from `src/pack/{name}/index.ts`:

```typescript
import type { Pack } from "../pack"

export const myPack: Pack = {
  id: "my-pack",
  agents: [...],
  tools: [...],
  prompts: [...],
  instructions: ["MY_INSTRUCTIONS.md"],
  bootstrap: async () => {
    // Initialize services
  },
  onFileWrite: async (filepath) => {
    // Post-process file writes
  },
}
```

3. Register in `src/pack/index.ts`:

```typescript
import { myPack } from "./my-pack"

export const packs = [codingPack, notesPack, myPack]
```

4. Users opt in via config:

```json
{
  "packs": ["coding", "my-pack"]
}
```

### Pack Resolution

The `PackRegistry` service (`src/pack/registry.ts`) resolves pack IDs at runtime:

```typescript
// Resolve pack list from IDs
const packs = yield * PackRegistry.resolve(["coding", "notes"], availablePacks)

// Access contributions
const agents = yield * PackRegistry.agents()
const tools = yield * PackRegistry.tools()
```

### Testing Packs

Run the integration test suite:

```bash
bun test test/pack/
```

Key test files:

- `test/pack/integration/coding-pack-parity.test.ts` — Verify default behavior
- `test/pack/integration/core-only.test.ts` — Test core-only mode
- `test/pack/integration/mixed-packs.test.ts` — Multiple packs interaction

## Architecture

```
src/
├── agent/          # Agent definitions and runtime
├── pack/           # Pack system implementation
│   ├── coding/     # coding-pack
│   ├── notes/      # notes-pack
│   ├── pack.ts     # Pack type definition
│   ├── registry.ts # Pack resolution service
│   └── index.ts    # Pack exports
├── plugin/         # Plugin API
├── session/        # Session management
├── tool/           # Tool implementations
└── tui/            # Terminal UI components
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun typecheck
```

See the root README for more information about the Keel project.
