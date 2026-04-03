import { createKeelClient, createKeelServer } from "@keel-ai/sdk"
import { readdir } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

const server = await createKeelServer()
const client = createKeelClient({ baseUrl: server.url })

const input = (await readdir("packages/core", { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
  .map((entry) => path.join("packages/core", entry.name))

const tasks: Promise<void>[] = []
for await (const file of input) {
  console.log("processing", file)
  const session = await client.session.create()
  if (!session.data) continue
  tasks.push(
    client.session
      .prompt({
        sessionID: session.data.id,
        parts: [
          {
            type: "file",
            mime: "text/plain",
            url: pathToFileURL(file).href,
          },
          {
            type: "text",
            text: `Write tests for every public function in this file.`,
          },
        ],
      })
      .then(() => {}),
  )
  console.log("done", file)
}

await Promise.all(
  input.map(async (file) => {
    const session = await client.session.create()
    if (!session.data) return
    console.log("processing", file)
    await client.session.prompt({
      sessionID: session.data.id,
      parts: [
        {
          type: "file",
          mime: "text/plain",
          url: pathToFileURL(file).href,
        },
        {
          type: "text",
          text: `Write tests for every public function in this file.`,
        },
      ],
    })
    console.log("done", file)
  }),
)
