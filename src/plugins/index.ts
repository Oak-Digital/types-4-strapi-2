import EventEmitter from "events";
import { SupportedPluginNamesType } from "./types";
import registerUrlAlias from "./url-alias";

export const registerPlugins = (pluginNames: Set<SupportedPluginNamesType>, eventEmitter: EventEmitter) => {
    if (pluginNames.has('url-alias')) {
        registerUrlAlias(eventEmitter);
    }
}
