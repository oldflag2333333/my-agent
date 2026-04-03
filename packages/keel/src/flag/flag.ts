import { Config } from "effect"

function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

export namespace Flag {
  export const KEEL_AUTO_SHARE = truthy("KEEL_AUTO_SHARE")
  export const KEEL_GIT_BASH_PATH = process.env["KEEL_GIT_BASH_PATH"]
  export const KEEL_CONFIG = process.env["KEEL_CONFIG"]
  export declare const KEEL_PURE: boolean
  export declare const KEEL_TUI_CONFIG: string | undefined
  export declare const KEEL_CONFIG_DIR: string | undefined
  export declare const KEEL_PLUGIN_META_FILE: string | undefined
  export const KEEL_CONFIG_CONTENT = process.env["KEEL_CONFIG_CONTENT"]
  export const KEEL_DISABLE_AUTOUPDATE = truthy("KEEL_DISABLE_AUTOUPDATE")
  export const KEEL_ALWAYS_NOTIFY_UPDATE = truthy("KEEL_ALWAYS_NOTIFY_UPDATE")
  export const KEEL_DISABLE_PRUNE = truthy("KEEL_DISABLE_PRUNE")
  export const KEEL_DISABLE_TERMINAL_TITLE = truthy("KEEL_DISABLE_TERMINAL_TITLE")
  export const KEEL_SHOW_TTFD = truthy("KEEL_SHOW_TTFD")
  export const KEEL_PERMISSION = process.env["KEEL_PERMISSION"]
  export const KEEL_DISABLE_DEFAULT_PLUGINS = truthy("KEEL_DISABLE_DEFAULT_PLUGINS")
  export const KEEL_DISABLE_LSP_DOWNLOAD = truthy("KEEL_DISABLE_LSP_DOWNLOAD")
  export const KEEL_ENABLE_EXPERIMENTAL_MODELS = truthy("KEEL_ENABLE_EXPERIMENTAL_MODELS")
  export const KEEL_DISABLE_AUTOCOMPACT = truthy("KEEL_DISABLE_AUTOCOMPACT")
  export const KEEL_DISABLE_MODELS_FETCH = truthy("KEEL_DISABLE_MODELS_FETCH")
  export const KEEL_DISABLE_CLAUDE_CODE = truthy("KEEL_DISABLE_CLAUDE_CODE")
  export const KEEL_DISABLE_CLAUDE_CODE_PROMPT =
    KEEL_DISABLE_CLAUDE_CODE || truthy("KEEL_DISABLE_CLAUDE_CODE_PROMPT")
  export const KEEL_DISABLE_CLAUDE_CODE_SKILLS =
    KEEL_DISABLE_CLAUDE_CODE || truthy("KEEL_DISABLE_CLAUDE_CODE_SKILLS")
  export const KEEL_DISABLE_EXTERNAL_SKILLS =
    KEEL_DISABLE_CLAUDE_CODE_SKILLS || truthy("KEEL_DISABLE_EXTERNAL_SKILLS")
  export declare const KEEL_DISABLE_PROJECT_CONFIG: boolean
  export const KEEL_FAKE_VCS = process.env["KEEL_FAKE_VCS"]
  export declare const KEEL_CLIENT: string
  export const KEEL_SERVER_PASSWORD = process.env["KEEL_SERVER_PASSWORD"]
  export const KEEL_SERVER_USERNAME = process.env["KEEL_SERVER_USERNAME"]
  export const KEEL_ENABLE_QUESTION_TOOL = truthy("KEEL_ENABLE_QUESTION_TOOL")

  // Experimental
  export const KEEL_EXPERIMENTAL = truthy("KEEL_EXPERIMENTAL")
  export const KEEL_EXPERIMENTAL_FILEWATCHER = Config.boolean("KEEL_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  )
  export const KEEL_EXPERIMENTAL_DISABLE_FILEWATCHER = Config.boolean(
    "KEEL_EXPERIMENTAL_DISABLE_FILEWATCHER",
  ).pipe(Config.withDefault(false))
  export const KEEL_EXPERIMENTAL_ICON_DISCOVERY =
    KEEL_EXPERIMENTAL || truthy("KEEL_EXPERIMENTAL_ICON_DISCOVERY")

  const copy = process.env["KEEL_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
  export const KEEL_EXPERIMENTAL_DISABLE_COPY_ON_SELECT =
    copy === undefined ? process.platform === "win32" : truthy("KEEL_EXPERIMENTAL_DISABLE_COPY_ON_SELECT")
  export const KEEL_ENABLE_EXA =
    truthy("KEEL_ENABLE_EXA") || KEEL_EXPERIMENTAL || truthy("KEEL_EXPERIMENTAL_EXA")
  export const KEEL_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS = number("KEEL_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS")
  export const KEEL_EXPERIMENTAL_OUTPUT_TOKEN_MAX = number("KEEL_EXPERIMENTAL_OUTPUT_TOKEN_MAX")
  export const KEEL_EXPERIMENTAL_OXFMT = KEEL_EXPERIMENTAL || truthy("KEEL_EXPERIMENTAL_OXFMT")
  export const KEEL_EXPERIMENTAL_LSP_TY = truthy("KEEL_EXPERIMENTAL_LSP_TY")
  export const KEEL_EXPERIMENTAL_LSP_TOOL = KEEL_EXPERIMENTAL || truthy("KEEL_EXPERIMENTAL_LSP_TOOL")
  export const KEEL_DISABLE_FILETIME_CHECK = Config.boolean("KEEL_DISABLE_FILETIME_CHECK").pipe(
    Config.withDefault(false),
  )
  export const KEEL_EXPERIMENTAL_PLAN_MODE = KEEL_EXPERIMENTAL || truthy("KEEL_EXPERIMENTAL_PLAN_MODE")
  export const KEEL_EXPERIMENTAL_WORKSPACES = KEEL_EXPERIMENTAL || truthy("KEEL_EXPERIMENTAL_WORKSPACES")
  export const KEEL_EXPERIMENTAL_MARKDOWN = !falsy("KEEL_EXPERIMENTAL_MARKDOWN")
  export const KEEL_MODELS_URL = process.env["KEEL_MODELS_URL"]
  export const KEEL_MODELS_PATH = process.env["KEEL_MODELS_PATH"]
  export const KEEL_DISABLE_EMBEDDED_WEB_UI = truthy("KEEL_DISABLE_EMBEDDED_WEB_UI")
  export const KEEL_DB = process.env["KEEL_DB"]
  export const KEEL_DISABLE_CHANNEL_DB = truthy("KEEL_DISABLE_CHANNEL_DB")
  export const KEEL_SKIP_MIGRATIONS = truthy("KEEL_SKIP_MIGRATIONS")
  export const KEEL_STRICT_CONFIG_DEPS = truthy("KEEL_STRICT_CONFIG_DEPS")

  function number(key: string) {
    const value = process.env[key]
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
}

// Dynamic getter for KEEL_DISABLE_PROJECT_CONFIG
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "KEEL_DISABLE_PROJECT_CONFIG", {
  get() {
    return truthy("KEEL_DISABLE_PROJECT_CONFIG")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for KEEL_TUI_CONFIG
// This must be evaluated at access time, not module load time,
// because tests and external tooling may set this env var at runtime
Object.defineProperty(Flag, "KEEL_TUI_CONFIG", {
  get() {
    return process.env["KEEL_TUI_CONFIG"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for KEEL_CONFIG_DIR
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "KEEL_CONFIG_DIR", {
  get() {
    return process.env["KEEL_CONFIG_DIR"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for KEEL_PURE
// This must be evaluated at access time, not module load time,
// because the CLI can set this flag at runtime
Object.defineProperty(Flag, "KEEL_PURE", {
  get() {
    return truthy("KEEL_PURE")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for KEEL_PLUGIN_META_FILE
// This must be evaluated at access time, not module load time,
// because tests and external tooling may set this env var at runtime
Object.defineProperty(Flag, "KEEL_PLUGIN_META_FILE", {
  get() {
    return process.env["KEEL_PLUGIN_META_FILE"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for KEEL_CLIENT
// This must be evaluated at access time, not module load time,
// because some commands override the client at runtime
Object.defineProperty(Flag, "KEEL_CLIENT", {
  get() {
    return process.env["KEEL_CLIENT"] ?? "cli"
  },
  enumerable: true,
  configurable: false,
})
