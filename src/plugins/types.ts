import { HooksType } from "./PluginManager";

export const supportedPluginNames = [
    'url-alias',
] as const;

export type SupportedPluginNamesType = typeof supportedPluginNames[number];

export type PluginRegister = () => Partial<HooksType>;
