import HomeTips from "../feature-plugins/home/tips"
import SidebarContext from "../feature-plugins/sidebar/context"
import PluginManager from "../feature-plugins/system/plugins"
import type { TuiPlugin, TuiPluginModule } from "@keel-ai/plugin/tui"
import { PackRegistry } from "@/pack/registry"
import { Config } from "@/config/config"

export type InternalTuiPlugin = TuiPluginModule & {
  id: string
  tui: TuiPlugin
}

const guard = (plugin: InternalTuiPlugin): InternalTuiPlugin => ({
  ...plugin,
  tui: async (api, options, meta) => {
    const cfg = await Config.get()
    if (!cfg.packs.includes("coding")) return
    return plugin.tui(api, options, meta)
  },
})

export const INTERNAL_TUI_PLUGINS: InternalTuiPlugin[] = [HomeTips, SidebarContext, PluginManager]

import { codingTui } from "@/pack/coding/tui"
INTERNAL_TUI_PLUGINS.push(...(codingTui as InternalTuiPlugin[]).map(guard))
