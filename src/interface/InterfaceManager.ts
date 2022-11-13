import { existsSync } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path/posix';
import {
    createMediaFormatInterface,
    createMediaInterface,
} from './builtinInterfaces';
import ComponentInterface from './ComponentInterface';
import Interface from './Interface';
import {
    getApiSchemas,
    getComponentCategoryFolders,
    getComponentSchemas,
} from './schemaReader';
import prettier from 'prettier';
import { pascalCase } from 'pascal-case';
import { caseType, caseTypesArray, changeCase, checkCaseType } from '../case';
import EventEmitter from 'events';
import { Events } from '../events';
import { registerPlugins } from '../plugins';
import { supportedPluginNames, SupportedPluginNamesType } from '../plugins/types';

export default class InterfaceManager {
    private Interfaces: Record<string, Interface> = {}; // string = strapi name
    private OutRoot: string;
    private StrapiSrcRoot: string;
    private Options: typeof InterfaceManager.BaseOptions;
    private PrettierOptions: any;
    public eventEmitter: EventEmitter = new EventEmitter();

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

    constructor(outRoot: string, strapiSrcRoot: string, options: Partial<typeof InterfaceManager['BaseOptions']> = {}) {
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
        this.validateOptions();
        this.registerPlugins();
    }

    registerPlugins() {
        const pluginNames = new Set<SupportedPluginNamesType>(this.Options.enabledPlugins);
        registerPlugins(pluginNames, this.eventEmitter);
    }

    validateOptions() {
        if (!checkCaseType(this.Options.fileCaseType)) {
            throw new Error(`${this.Options.fileCaseType} is not a supported type, please use one of the following ${caseTypesArray.join(', ')}`);
        }
        if (!checkCaseType(this.Options.folderCaseType)) {
            throw new Error(`${this.Options.folderCaseType} is not a supported type, please use one of the following ${caseTypesArray.join(', ')}`);
        }

        this.Options.enabledPlugins.forEach((enabledPlugin) => {
            if (!supportedPluginNames.includes(enabledPlugin)) {
                throw new Error(`${enabledPlugin} is not a supported plugin, please open an issue on https://github.com/Oak-Digital/types-4-strapi-2 or only use the following plugins [${supportedPluginNames.join(', ')}]`);
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
        this.eventEmitter.emit(Events.BeforeReadSchema, {
            apiSchemas: apiSchemasPre,
            componentSchemas: componentSchemasPre,
        });

        const [apiSchemas, componentSchemas] = await Promise.all([apiSchemasPromise, componentSchemasPromise]);

        const newObject ={
            apiSchemas: [...apiSchemasPre, ...apiSchemas],
            componentSchemas: [...componentSchemasPre, ...componentSchemas],
        };

        this.eventEmitter.emit(Events.AfterReadSchema, newObject);

        return newObject;
    }

    async createInterfaces() {
        const { apiSchemas, componentSchemas } = await this.readSchemas();

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
            this.Interfaces[strapiName] = inter;
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
                const categoryFolderName = changeCase(categoryName, this.Options.folderCaseType);
                // make component interface
                const inter = new ComponentInterface(
                    componentName,
                    schema.attributes,
                    `./${categoryFolderName}`,
                    categoryName,
                    this.Options.fileCaseType,
                    prefix
                );
                this.Interfaces[strapiName] = inter;
            });
        });
    }

    createBuiltinInterfaces() {
        const outDirName = changeCase('builtins', this.Options.folderCaseType);
        const outDir = `./${outDirName}`;
        const builtinInterfaces = [];
        builtinInterfaces.push(
            createMediaInterface(outDir, this.Options.fileCaseType, this.Options.prefix)
        );
        builtinInterfaces.push(
            createMediaFormatInterface(outDir, this.Options.fileCaseType, this.Options.prefix)
        );
        builtinInterfaces.forEach((inter) => {
            this.Interfaces[inter.getStrapiName()] = inter;
        });
    }

    // Inject dependencies into all interfaces
    injectDependencies() {
        // console.log("Injecting dependencies")
        Object.keys(this.Interfaces).forEach((strapiName: string) => {
            const inter = this.Interfaces[strapiName];
            const dependencies = inter.getDependencies();
            // console.log(`Interfaces for ${inter.getStrapiName()} are`)
            const interfacesToInject = dependencies
                .map((dependencyStrapiName: string) => {
                    return this.Interfaces[dependencyStrapiName];
                })
                .filter((inter) => inter);
            inter.setRelations(interfacesToInject);
        });
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
                const folderName = changeCase(category, this.Options.folderCaseType);
                const path = join(this.OutRoot, folderName);
                if (existsSync(path)) {
                    return;
                }
                await mkdir(path);
            }
        );
        promises.push(...componentCategoriesPromises);
        const builintsFolderName = changeCase('builtins', this.Options.folderCaseType);
        const builtinsPath = join(this.OutRoot, builintsFolderName);
        if (!existsSync(builtinsPath)) {
            promises.push(mkdir(builtinsPath));
        }

        await Promise.all(promises);
    }

    async writeInterfaces() {
        const writePromises = Object.keys(this.Interfaces).map(
            async (strapiName) => {
                const inter = this.Interfaces[strapiName];
                const fileData = inter.toString();
                const formattedFileData = prettier.format(
                    fileData,
                    this.PrettierOptions
                );
                const filePath = join(
                    this.OutRoot,
                    inter.getRelativeRootPathFile()
                );
                await writeFile(filePath, formattedFileData);
            }
        );
        await Promise.all(writePromises);
    }

    async writeIndexFile() {
        const strings = Object.keys(this.Interfaces).map(
            (strapiName: string) => {
                const inter = this.Interfaces[strapiName];
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
