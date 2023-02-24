import { existsSync } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join, dirname } from 'path/posix';
import {
    createMediaFormatInterface,
    createMediaInterface,
} from '../interface/builtinInterfaces';
import ComponentInterface from '../interface/ComponentInterface';
import Interface from '../interface/Interface';
import {
    getApiSchemas,
    getComponentCategoryFolders,
    getComponentSchemas,
} from '../content-types/reader';
import prettier from 'prettier';
import { pascalCase } from 'pascal-case';
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

export default class InterfaceManager {
    private Files: Record<string, File> = {}; // string = strapi name
    private OutRoot: string;
    private StrapiSrcRoot: string;
    private Options: typeof InterfaceManager.BaseOptions;
    private PrettierOptions: any;
    private PluginManager: PluginManager;
    private dependenciesInjected: boolean = false;

    static BaseOptions = {
        prefix: 'I',
        useCategoryPrefix: true,
        componentPrefix: '',
        componentPrefixOverridesPrefix: false,
        builtinsPrefix: '', // TODO: make this work
        builtinsPrefixOverridesPrefix: false, // TODO: make this work
        deleteOld: false,
        prettierFile: null,
        fileCaseType: 'pascal' as caseType,
        folderCaseType: 'kebab' as caseType,
        enabledPlugins: <SupportedPluginNamesType[]>[],
    };

    constructor(
        outRoot: string,
        strapiSrcRoot: string,
        options: Partial<typeof InterfaceManager['BaseOptions']> = {}
    ) {
        this.OutRoot = outRoot;
        this.StrapiSrcRoot = strapiSrcRoot;
        this.Options = {
            ...InterfaceManager.BaseOptions,
            ...options,
        };
        // Make sure all options are set
        Object.keys(this.Options).map((name) => {
            if (this.Options[name] === undefined) {
                this.Options[name] = InterfaceManager.BaseOptions[name];
            }
        });
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
                `${
                    this.Options.fileCaseType
                } is not a supported type, please use one of the following ${caseTypesArray.join(
                    ', '
                )}`
            );
        }
        if (!checkCaseType(this.Options.folderCaseType)) {
            throw new Error(
                `${
                    this.Options.folderCaseType
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

    async loadPrettierConfig() {
        const defaultOptions = {
            parser: 'typescript',
        };
        if (!this.Options.prettierFile) {
            this.PrettierOptions = defaultOptions;
            return;
        }
        const resolved = await prettier.resolveConfig(
            this.Options.prettierFile,
            {
                editorconfig: true,
            }
        );
        this.PrettierOptions = Object.assign({}, defaultOptions, resolved);
    }

    async readSchemas() {
        const apiSchemasPre = [];
        const componentSchemasPre = [];
        const apiSchemasPromise = getApiSchemas(this.StrapiSrcRoot);
        const componentSchemasPromise = getComponentSchemas(this.StrapiSrcRoot);
        this.PluginManager.invoke(Events.BeforeReadSchema, this, {
            apiSchemas: apiSchemasPre,
            componentSchemas: componentSchemasPre,
        });

        const [apiSchemas, componentSchemas] = await Promise.all([
            apiSchemasPromise,
            componentSchemasPromise,
        ]);

        const newObject = {
            apiSchemas: [...apiSchemasPre, ...apiSchemas],
            componentSchemas: [...componentSchemasPre, ...componentSchemas],
        };

        this.PluginManager.invoke(Events.AfterReadSchema, this, newObject);

        return newObject;
    }

    public addType(name: string, file: File, force: boolean = false) {
        if (this.dependenciesInjected) {
            console.warn('You should not add types after dependencies have been injected');
        }
        if (this.Files[name] && !force) {
            return false;
        }

        this.Files[name] = file;

        return true;
    }

    async createInterfaces() {
        const { apiSchemas, componentSchemas } = await this.readSchemas();
        this.PluginManager.invoke(Events.BeforeReadSchemas, this);

        apiSchemas.forEach((schema) => {
            const { name, attributes } = schema;
            const strapiName = `api::${name}.${name}`;
            const inter = new Interface(
                name,
                attributes,
                './',
                this.Options.fileCaseType,
                this.Options.prefix
            );
            this.addType(strapiName, inter)
        });

        componentSchemas.forEach((category) => {
            const categoryName: string = category.category;
            category.schemas.forEach((schema) => {
                const componentName = schema.name;
                const strapiName = `${categoryName}.${schema.name}`;
                const componentPrefix = `${this.Options.componentPrefix}${
                    this.Options.useCategoryPrefix
                        ? pascalCase(categoryName)
                        : ''
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
                this.addType(strapiName, inter)
            });
        });

        this.PluginManager.invoke(Events.AfterReadSchemas, this);
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
        types.push(
            ...createExtraTypes()
        );

        types.forEach((t) => {
            this.addType(t.getStrapiName(), t);
        });
    }

    // Inject dependencies into all interfaces
    injectDependencies() {
        this.PluginManager.invoke(Events.BeforeInjectDependencies, this)

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
        this.PluginManager.invoke(Events.AfterInjectDependencies, this)
    }

    async deleteOldFolders() {
        await rm(this.OutRoot, {
            force: true,
            recursive: true,
        });
    }

    async makeFolders() {
        if (this.Options.deleteOld) {
            await this.deleteOldFolders();
        }
        const componentCategories = await getComponentCategoryFolders(
            this.StrapiSrcRoot
        );
        if (!existsSync(this.OutRoot)) {
            await mkdir(this.OutRoot, {
                recursive: true,
            });
        }
        const promises = [];
        const componentCategoriesPromises = componentCategories.map(
            async (category) => {
                const folderName = changeCase(
                    category,
                    this.Options.folderCaseType
                );
                const path = join(this.OutRoot, folderName);
                if (existsSync(path)) {
                    return;
                }
                await mkdir(path);
            }
        );
        promises.push(...componentCategoriesPromises);
        const builintsFolderName = changeCase(
            'builtins',
            this.Options.folderCaseType
        );
        const builtinsPath = join(this.OutRoot, builintsFolderName);
        if (!existsSync(builtinsPath)) {
            promises.push(mkdir(builtinsPath));
        }

        await Promise.all(promises);
    }

    async writeInterfaces() {
        /* const types = [ */
        /*     requiredByString, */
        /*     extractNestedString, */
        /*     extractFlatString, */
        /* ]; */
        /* const writeTypesPromises = types.map((t) => { */
        /*      */
        /* }); */
        const writePromises = Object.keys(this.Files).map(
            async (strapiName) => {
                const file = this.Files[strapiName];
                const fileData = file.toString();
                const formattedFileData = prettier.format(
                    fileData,
                    this.PrettierOptions
                );
                const filePath = join(
                    this.OutRoot,
                    file.getRelativeRootPathFile()
                );
                await mkdir(dirname(filePath), {
                    recursive: true,
                });
                await writeFile(filePath, formattedFileData);
            }
        );
        await Promise.all(writePromises);
    }

    async writeIndexFile() {
        const strings = Object.keys(this.Files).map(
            (strapiName: string) => {
                const inter = this.Files[strapiName];
                return `export * from '${inter.getRelativeRootPath()}'`;
            }
        );
        const fileData = strings.join('\n');
        const formattedFileData = prettier.format(
            fileData,
            this.PrettierOptions
        );
        const filePath = join(this.OutRoot, 'index.ts');
        await writeFile(filePath, formattedFileData);
    }

    async run() {
        try {
            const createInterfacesPromise = this.createInterfaces();
            const makeFoldersPromise = this.makeFolders();
            const loadPrettierPromise = this.loadPrettierConfig();
            this.createBuiltinInterfaces();
            await createInterfacesPromise;
            // Create all interfaces before injecting
            this.injectDependencies();
            await Promise.all([makeFoldersPromise, loadPrettierPromise]);
            await Promise.all([this.writeInterfaces(), this.writeIndexFile()]);
        } catch (err) {
            console.error(err);
        }
    }
}
