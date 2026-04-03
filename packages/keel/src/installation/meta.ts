declare global {
  const KEEL_VERSION: string
  const KEEL_CHANNEL: string
}

export const VERSION = typeof KEEL_VERSION === "string" ? KEEL_VERSION : "local"
export const CHANNEL = typeof KEEL_CHANNEL === "string" ? KEEL_CHANNEL : "local"
