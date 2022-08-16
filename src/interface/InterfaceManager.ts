import { existsSync } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { pascalCase } from '../utils';
import { createMediaFormatInterface, createMediaInterface } from './builtinInterfaces';
import ComponentInterface from './ComponentInterface';
import Interface from './Interface';
import { getApiSchemas, getComponentCategoryFolders, getComponentSchemas } from './schemaReader';

export default class InterfaceManager {
    private Interfaces: Record<string, Interface> = {}; // string = strapi name
    private OutRoot: string;
    private StrapiSrcRoot: string;
    private Options: any;

    static BaseOptions = {
        prefix: 'I',
        useCategoryPrefix: true,
        componentPrefix: '',
        componentPrefixOverridesPrefix: false,
        builtinsPrefix: '', // TODO: make this work
        builtinsPrefixOverridesPrefix: false // TODO: make this work
    };

    constructor(outRoot: string, strapiSrcRoot: string, options: any = {}) {
        this.OutRoot = outRoot;
        this.StrapiSrcRoot = strapiSrcRoot;
        this.Options = Object.assign({}, InterfaceManager.BaseOptions, options);
    }

    async createInterfaces() {
        const apiSchemasPromise = getApiSchemas(this.StrapiSrcRoot);
        const componentSchemasPromise = getComponentSchemas(this.StrapiSrcRoot);
        const apiSchemas = await apiSchemasPromise;
        apiSchemas.forEach((schema) => {
            const { name, attributes } = schema;
            const strapiName = `api::${name}.${name}`;
            const inter = new Interface(name, attributes, './', this.Options.prefix);
            this.Interfaces[strapiName] = inter;
        });

        const componentSchemas = await componentSchemasPromise;
        componentSchemas.forEach((category) => {
            const categoryName : string = category.category;
            category.schemas.forEach((schema) => {
                const componentName = schema.name;
                const strapiName = `${categoryName}.${schema.name}`;
                const componentPrefix = `${this.Options.componentPrefix}${this.Options.useCategoryPrefix ? pascalCase(categoryName) : ''}`;
                const prefix = this.Options.componentPrefixOverridesPrefix ? componentPrefix : this.Options.prefix + componentPrefix;
                // TODO: make component interface
                const inter = new ComponentInterface(componentName, schema.attributes, `./${categoryName}`, categoryName, prefix);
                this.Interfaces[strapiName] = inter;
            });
        });
    }

    createBuiltinInterfaces() {
        const outDir = './builtins';
        const builtinInterfaces = [];
        builtinInterfaces.push(createMediaInterface(outDir, this.Options.prefix));
        builtinInterfaces.push(createMediaFormatInterface(outDir, this.Options.prefix));
        builtinInterfaces.forEach(inter => {
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
            const interfacesToInject = dependencies.map((dependencyStrapiName: string) => {
                return this.Interfaces[dependencyStrapiName];
            }).filter((inter) => inter);
            inter.setRelations(interfacesToInject);
        });
    }

    async makeFolders() {
        const componentCategories = await getComponentCategoryFolders(this.StrapiSrcRoot);
        if (!existsSync(this.OutRoot)) {
            await mkdir(this.OutRoot, {
                recursive: true,
            });
        }
        const promises = [];
        const componentCategoriesPromises = componentCategories.map(async (category) => {
            const path = join(this.OutRoot, category);
            if (existsSync(path)) {
                return;
            }
            await mkdir(path);
        });
        promises.push(...componentCategoriesPromises);
        const builtinsPath = join(this.OutRoot, 'builtins');
        if (!existsSync(builtinsPath)) {
            promises.push(mkdir(join(this.OutRoot, 'builtins')));
        }

        await Promise.all(promises);
    }

    async writeInterfaces() {
        const writePromises = Object.keys(this.Interfaces).map(async (strapiName) => {
            const inter = this.Interfaces[strapiName];
            const fileData = inter.toString();
            const filePath = join(this.OutRoot, inter.getRelativeRootPathFile());
            await writeFile(filePath, fileData);
        });
        await Promise.all(writePromises);
    }

    async writeIndexFile() {
        const strings = Object.keys(this.Interfaces).map((strapiName: string) => {
            const inter = this.Interfaces[strapiName];
            return `export * from '${inter.getRelativeRootPath()}'`;
        });
        const fileData = strings.join('\n');
        const filePath = join(this.OutRoot, 'index.ts');
        await writeFile(filePath, fileData);
    }

    async run() {
        try {
            const createInterfacesPromise = this.createInterfaces();
            const makeFoldersPromise = this.makeFolders();
            this.createBuiltinInterfaces();
            await createInterfacesPromise;
            // Create all interfaces before injecting
            this.injectDependencies();
            await makeFoldersPromise;
            await Promise.all([this.writeInterfaces(), this.writeIndexFile()]);
        } catch (err) {
            console.error(err);
        }
    }
}
