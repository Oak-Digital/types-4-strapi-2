import { SupportedPluginNamesType } from './types';
import registerUrlAlias from './url-alias';
import { PluginManager } from './PluginManager';

export const registerBuiltinPlugins = (
    pluginManager: PluginManager,
    pluginNames: Set<SupportedPluginNamesType>,
) => {
    if (pluginNames.has('url-alias')) {
        pluginManager.registerPlugin(registerUrlAlias());
    }
};
