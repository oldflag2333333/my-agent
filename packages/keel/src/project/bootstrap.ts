import { Plugin } from "../plugin"
import { File } from "../file"
import { FileWatcher } from "../file/watcher"
import { Snapshot } from "../snapshot"
import { Project } from "./project"
import { Bus } from "../bus"
import { Command } from "../command"
import { Instance } from "./instance"
import { Log } from "@/util/log"
import { ShareNext } from "@/share/share-next"
import { Config } from "@/config/config"
import { PackRegistry } from "@/pack"
import { packs } from "@/pack"

export async function InstanceBootstrap() {
  Log.Default.info("bootstrapping", { directory: Instance.directory })
  await Plugin.init()
  ShareNext.init()

  PackRegistry.init((await Config.get()).packs, packs)
  for (const hook of await PackRegistry.bootstraps()) {
    await hook()
  }

  File.init()
  FileWatcher.init()
  Snapshot.init()

  Bus.subscribe(Command.Event.Executed, async (payload) => {
    if (payload.properties.name === Command.Default.INIT) {
      Project.setInitialized(Instance.project.id)
    }
  })
}
