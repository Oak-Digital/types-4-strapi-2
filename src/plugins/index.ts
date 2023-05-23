import { SupportedPluginNamesType } from './types';
import registerUrlAlias from './url-alias';
import registerDraftAndPublish from './draft-and-publish';
import registerI18n from './i18n';
import { PluginManager } from './PluginManager';

export const registerBuiltinPlugins = (
    pluginManager: PluginManager,
    pluginNames: Set<SupportedPluginNamesType>
) => {
    // Draft and publish is always registered since it is built into Strapi
    pluginManager.registerPlugin(registerDraftAndPublish());

    if (pluginNames.has('url-alias')) {
        pluginManager.registerPlugin(registerUrlAlias());
    }

    if (pluginNames.has('i18n')) {
        pluginManager.registerPlugin(registerI18n());
    }
};
