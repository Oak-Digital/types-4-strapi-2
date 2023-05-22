import {
    createMediaFormatInterface,
    createMediaInterface,
} from '../interface/builtinInterfaces';
import ComponentInterface from '../interface/ComponentInterface';
import Interface from '../interface/Interface';
import prettier from 'prettier';
import { pascalCase } from 'change-case';
import {
    caseType,
    caseTypesArray,
    changeCase,
    checkCaseType,
} from '../utils/casing/';
import { Events } from '../events';
import { registerBuiltinPlugins } from '../plugins';
import {
    supportedPluginNames,
    SupportedPluginNamesType,
} from '../plugins/types';
import { PluginManager } from '../plugins/PluginManager';
import { File } from '../file/File';
import { createExtraTypes } from '../extra-types/createExtraTypes';
import { ContentTypeReader } from '../readers/types/content-type-reader';
import { InterfaceWriter } from '../writers/types/writer';

type InterfaceManagerOptions = {
    /**
     * @default 'I'
     * @type {string}
     * @description The prefix to use for all interfaces
     */
    prefix?: string;
    /**
     * @default true
     * @type {boolean}
     * @description Whether to use the category prefix for component interfaces
     */
    useCategoryPrefix?: boolean;
    /**
     * @default ''
     * @type {string}
     * @description The prefix to use for component interfaces
     */
    componentPrefix?: string;
    /**
     * @default false
     * @type {boolean}
     * @description Whether to use only the component prefix for component interfaces
     */
    componentPrefixOverridesPrefix?: boolean;
    /**
     * @default ''
     * @type {string}
     * @description The prefix to use for builtin interfaces
     */
    /* builtinsPrefix?: string; */
    /**
     * @default false
     * @type {boolean}
     * @description Whether to use only the builtin prefix for builtin interfaces
     */
    /* builtinsPrefixOverridesPrefix?: boolean; */
    /**
     * @default null
     * @type {string}
     * @description The path to the prettier config file
     */
    fileCaseType?: caseType;
    /**
     * @default 'kebab'
     * @type {caseType}
     * @description The case type to use for folder names
     */
    folderCaseType?: caseType;
    /**
     * @default []
     * @type {SupportedPluginNamesType[]}
     * @description The plugins to use
     */
    enabledPlugins?: SupportedPluginNamesType[];
}

export default class InterfaceManager {
    private Files: Record<string, File> = {}; // string = strapi name
    private Options: InterfaceManagerOptions;
    private PluginManager: PluginManager;
    private dependenciesInjected: boolean = false;
    private contentTypeReader: ContentTypeReader;
    private interfaceWriter: InterfaceWriter;

    constructor(
        reader: ContentTypeReader,
        writer: InterfaceWriter,
        {
        prefix = 'I',
        useCategoryPrefix = true,
        componentPrefix = '',
        componentPrefixOverridesPrefix = false,
        /* builtinsPrefix = '', */
        /* builtinsPrefixOverridesPrefix = false, */
        fileCaseType = 'pascal',
        folderCaseType = 'kebab',
        enabledPlugins = [],
        }: Partial<InterfaceManagerOptions> = {}
    ) {
        this.contentTypeReader = reader;
        this.interfaceWriter = writer;
        this.Options = {
            prefix,
            useCategoryPrefix,
            componentPrefix,
            componentPrefixOverridesPrefix,
            /* builtinsPrefix, */
            /* builtinsPrefixOverridesPrefix, */
            fileCaseType,
            folderCaseType,
            enabledPlugins,
        };
        this.PluginManager = new PluginManager();
        this.validateOptions();
        this.registerBuiltinPlugins();
    }

    registerBuiltinPlugins() {
        const pluginNames = new Set<SupportedPluginNamesType>(
            this.Options.enabledPlugins
        );
        registerBuiltinPlugins(this.PluginManager, pluginNames);
        this.PluginManager.sortHooks();
    }

    // TODO: this function let's the user register their own plugins
    registerPlugin() {
        throw new Error('Not implemented');
    }

    validateOptions() {
        if (!checkCaseType(this.Options.fileCaseType)) {
            throw new Error(
                `${this.Options.fileCaseType
                } is not a supported type, please use one of the following ${caseTypesArray.join(
                    ', '
                )}`
            );
        }
        if (!checkCaseType(this.Options.folderCaseType)) {
            throw new Error(
                `${this.Options.folderCaseType
                } is not a supported type, please use one of the following ${caseTypesArray.join(
                    ', '
                )}`
            );
        }

        this.Options.enabledPlugins.forEach((enabledPlugin) => {
            if (!supportedPluginNames.includes(enabledPlugin)) {
                throw new Error(
                    `plugin: \`${enabledPlugin}\` is not a supported plugin, please open an issue on https://github.com/Oak-Digital/types-4-strapi-2 if you want this included or only use the following plugins [${supportedPluginNames.join(
                        ', '
                    )}]`
                );
            }
        });
    }

    async readSchemas() {
        const apiSchemasPre = {};
        const componentSchemasPre = {};

        const apiSchemasPromise = this.contentTypeReader.readContentTypes();
        const componentSchemasPromise = this.contentTypeReader.readComponents();

        /* this.PluginManager.invoke(Events.BeforeReadSchema, this, { */
        /*     apiSchemas: apiSchemasPre, */
        /*     componentSchemas: componentSchemasPre, */
        /* }); */

        const [apiSchemas, componentSchemas] = await Promise.all([
            apiSchemasPromise,
            componentSchemasPromise,
        ]);

        const newObject: {
            apiSchemas: typeof apiSchemas;
            componentSchemas: typeof componentSchemas;
        } = {
            apiSchemas: { ...apiSchemasPre, ...apiSchemas },
            componentSchemas: { ...componentSchemasPre, ...componentSchemas },
        };

        /* this.PluginManager.invoke(Events.AfterReadSchema, this, newObject); */

        return newObject;
    }

    public addType(name: string, file: File, force: boolean = false) {
        if (this.dependenciesInjected) {
            console.warn(
                'You should not add types after dependencies have been injected'
            );
        }
        if (this.Files[name] && !force) {
            return false;
        }

        this.Files[name] = file;

        return true;
    }

    async createInterfaces() {
        const { apiSchemas, componentSchemas } = await this.readSchemas();
        /* this.PluginManager.invoke(Events.BeforeReadSchemas, this); */

        Object.entries(apiSchemas).forEach(([name, schema]) => {
            let strapiName = name;
            if (schema.namespace === 'admin') {
                strapiName = `admin::${schema.name}`;
            } else {
                /* strapiName = `${schema.namespace}::${schema.collection}.${schema.name}`; */
            }
            const attributes = schema.contentType.attributes;
            const inter = new Interface(
                schema.name,
                schema.namespace,
                attributes,
                './',
                schema.collection,
                this.Options.fileCaseType,
                this.Options.prefix
            );
            this.addType(strapiName, inter);
        });

        Object.entries(componentSchemas).forEach(([name, schema]) => {
            const strapiName = name;
            const componentName = name.split('.')[1];
            const categoryName = name.split('.')[0];
            const attributes = schema.attributes;
            const componentPrefix = `${this.Options.componentPrefix}${this.Options.useCategoryPrefix ? pascalCase(categoryName) : ''
                }`;
            const prefix = this.Options.componentPrefixOverridesPrefix
                ? componentPrefix
                : this.Options.prefix + componentPrefix;
            const categoryFolderName = changeCase(
                categoryName,
                this.Options.folderCaseType
            );
            // make component interface
            const inter = new ComponentInterface(
                componentName,
                schema.attributes,
                `./${categoryFolderName}`,
                categoryName,
                this.Options.fileCaseType,
                prefix
            );
            this.addType(strapiName, inter);
        });

        /* this.PluginManager.invoke(Events.AfterReadSchemas, this); */
    }

    createBuiltinInterfaces() {
        // Interfaces
        const outDirName = changeCase('builtins', this.Options.folderCaseType);
        const outDir = `./${outDirName}`;
        const builtinInterfaces = [];
        builtinInterfaces.push(
            createMediaInterface(
                outDir,
                this.Options.fileCaseType,
                this.Options.prefix
            )
        );
        builtinInterfaces.push(
            createMediaFormatInterface(
                outDir,
                this.Options.fileCaseType,
                this.Options.prefix
            )
        );
        builtinInterfaces.forEach((inter) => {
            this.addType(inter.getStrapiName(), inter);
        });

        // Types
        const types = [];
        types.push(...createExtraTypes());

        types.forEach((t) => {
            this.addType(t.getStrapiName(), t);
        });
    }

    // Inject dependencies into all interfaces
    injectDependencies() {
        this.PluginManager.invoke(Events.BeforeInjectDependencies, this);

        Object.keys(this.Files).forEach((strapiName: string) => {
            const file = this.Files[strapiName];
            const dependencies = file.getDependencies();
            // console.log(`Interfaces for ${inter.getStrapiName()} are`)
            const interfacesToInject = dependencies
                .map((dependencyStrapiName: string) => {
                    return this.Files[dependencyStrapiName];
                })
                .filter((inter) => inter);
            file.setRelations(interfacesToInject);
        });

        this.dependenciesInjected = true;
        this.PluginManager.invoke(Events.AfterInjectDependencies, this);
    }

    async run() {
        try {
            const createInterfacesPromise = this.createInterfaces();
            this.createBuiltinInterfaces();
            await createInterfacesPromise;
            // Create all interfaces before injecting
            this.injectDependencies();
            await this.interfaceWriter.write(
                Object.keys(this.Files).map((key) => this.Files[key])
            );
        } catch (err) {
            console.error(err);
        }
    }
}
