import { Events } from '../events';
import InterfaceManager from '../program/InterfaceManager';

// TODO: figure out which state is needed for each plugin
export type HookTypes = {
    BeforeReadSchema: (state: InterfaceManager, schema: any) => void;
    AfterReadSchema: (state: InterfaceManager, schema: any) => void;

    BeforeReadSchemas: (state: InterfaceManager) => void;
    AfterReadSchemas: (state: InterfaceManager) => void;
};

export type HooksType = {
    [HookType in keyof HookTypes]: {
        fn: HookTypes[HookType];
        priority: number;
    }[];
};

export class PluginManager {
    hooks: HooksType = {
        BeforeReadSchema: [],
        BeforeReadSchemas: [],
        AfterReadSchema: [],
        AfterReadSchemas: [],
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
