export * from "./client.js"
export * from "./server.js"

import { createKeelClient } from "./client.js"
import { createKeelServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createKeel(options?: ServerOptions) {
  const server = await createKeelServer({
    ...options,
  })

  const client = createKeelClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
