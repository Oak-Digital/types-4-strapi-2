import { Events } from '../events';
import InterfaceManager from '../program/InterfaceManager';
import { ContentTypeReader } from '../readers/types/content-type-reader';

type Schemas = {
    apiSchemas: Awaited<ReturnType<ContentTypeReader['readContentTypes']>>;
    componentSchemas: Awaited<ReturnType<ContentTypeReader['readComponents']>>;
};
// TODO: figure out which state is needed for each plugin
export type HookTypes = {
    [Events.BeforeReadSchema]: (
        state: InterfaceManager,
        schema: Schemas
    ) => void;
    [Events.AfterReadSchema]: (
        state: InterfaceManager,
        schema: Schemas
    ) => void;

    [Events.BeforeReadSchemas]: (state: InterfaceManager) => void;
    [Events.AfterReadSchemas]: (state: InterfaceManager) => void;

    [Events.ModifySchemas]: (state: InterfaceManager) => void;

    [Events.BeforeInjectDependencies]: (state: InterfaceManager) => void;
    [Events.AfterInjectDependencies]: (state: InterfaceManager) => void;
};

export type HooksType = {
    [HookType in keyof HookTypes]: {
        fn: HookTypes[HookType];
        priority: number;
    }[];
};

export class PluginManager {
    hooks: HooksType = {
        [Events.BeforeReadSchema]: [],
        [Events.BeforeReadSchemas]: [],
        [Events.AfterReadSchema]: [],
        [Events.AfterReadSchemas]: [],
        [Events.ModifySchemas]: [],
        [Events.BeforeInjectDependencies]: [],
        [Events.AfterInjectDependencies]: [],
    };

    registerPlugin(hooks: Partial<HooksType>) {
        for (const hook in hooks) {
            if (hooks[hook]) {
                this.hooks[hook].push(...hooks[hook]);
            }
        }
    }

    registerHook<Hook extends keyof HookTypes>(
        hook: Hook,
        fn: HookTypes[Hook],
        priority: number
    ) {
        this.hooks[hook].push({ fn, priority });
    }

    sortHooks() {
        for (const hook in this.hooks) {
            this.hooks[hook].sort((a, b) => a.priority - b.priority);
        }
    }

    invoke<Hook extends keyof HookTypes>(
        hook: Hook,
        ...args: Parameters<HookTypes[Hook]>
    ) {
        this.hooks[hook].forEach((hook) => {
            // @ts-ignore we know that it is the correct type, sunce HooksType is built from HookTypes
            hook.fn(...args);
        });
    }
}
