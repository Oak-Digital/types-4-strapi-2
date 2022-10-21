export const supportedPluginNames = [
    'url-alias',
] as const;

export type SupportedPluginNamesType = typeof supportedPluginNames[number];
