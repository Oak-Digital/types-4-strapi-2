import { HooksType } from "./PluginManager";

export const supportedPluginNames = [
    'url-alias',
    'i18n',
] as const;

export type SupportedPluginNamesType = typeof supportedPluginNames[number];

export type PluginRegister = () => Partial<HooksType>;
