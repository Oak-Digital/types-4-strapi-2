import { join } from 'path/posix';
import { ContentTypeReader } from './types/content-type-reader';
import { readDirFiltered } from '../utils';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { strapiComponent } from './types/component';
import { StrapiComponent } from './types/component';
import { strapiContentType } from './types/content-type';

export class ByFileContentTypeReader implements ContentTypeReader {
    private readonly strapiSrcRoot: string;

    constructor(strapiRoot: string) {
        this.strapiSrcRoot = join(strapiRoot, 'src');
    }

    async readComponents() {
        const categories = await this.getComponentCategoryFolders();
        const schemas: Record<`${string}.${string}`, StrapiComponent> = {};
        const nestedSchemasPromises = categories.map(
            async (category: string) => {
                const schemaFilesPath = join(
                    this.strapiSrcRoot,
                    'components',
                    category
                );
                const schemaFiles = await readDirFiltered(schemaFilesPath);
                const schemaNamesWithAttributesPromises = schemaFiles.map(
                    async (file: string) => {
                        const schemaPath = join(schemaFilesPath, file);
                        const schema = await this.readComponentSchema(
                            schemaPath
                        );
                        const name = file.split('.')[0];
                        schemas[`${category}.${name}`] = schema;
                    }
                );
                await Promise.all(schemaNamesWithAttributesPromises);
            }
        );
        await Promise.all(nestedSchemasPromises);
        return schemas;
    }

    async readContentTypes() {
        const apiFolders = await this.getApiFolders();
        const schemas: Awaited<
            ReturnType<ContentTypeReader['readContentTypes']>
        > = {};
        const schemasWithAttributesPromises = apiFolders.map(
            async (apiFolder: string) => {
                const contentTypesFolder = join(
                    this.strapiSrcRoot,
                    'api',
                    apiFolder,
                    'content-types'
                );
                if (!existsSync(contentTypesFolder)) {
                    return;
                }
                const contentTypesFolders = await readDirFiltered(
                    contentTypesFolder
                );
                const contentTypePromises = contentTypesFolders.map(
                    async (contentTypeFolder: string) => {
                        const schemaPath = join(
                            this.strapiSrcRoot,
                            'api',
                            apiFolder,
                            'content-types',
                            contentTypeFolder,
                            'schema.json'
                        );
                        const schema = await this.readContentTypeSchema(
                            schemaPath
                        );
                        const name = contentTypeFolder;
                        schemas[`api::${apiFolder}.${name}`] = {
                            collection: apiFolder,
                            name,
                            namespace: 'api',
                            contentType: schema,
                        };
                    }
                );
                await Promise.all(contentTypePromises);
            }
        );
        Promise.all(schemasWithAttributesPromises);
        return schemas;
    }

    private async readComponentSchema(schemaPath: string) {
        const schemaData = await readFile(schemaPath);
        try {
            const object = JSON.parse(schemaData.toString());
            const schema = strapiComponent.parse(object);
            return schema;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to parse schema: ${schemaPath}`);
        }
    }

    private async readContentTypeSchema(schemaPath: string) {
        const schemaData = await readFile(schemaPath);
        try {
            const object = JSON.parse(schemaData.toString());
            const schema = strapiContentType.parse(object);
            return schema;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to parse schema: ${schemaPath}`);
        }
    }

    private async getApiFolders() {
        const path = join(this.strapiSrcRoot, 'api');
        const folders = await readDirFiltered(path);
        return folders;
    }

    private async getComponentCategoryFolders() {
        const path = join(this.strapiSrcRoot, 'components');
        // If there exists no components, just fallback to an empty array.
        if (!existsSync(path)) {
            return [];
        }
        const folders = await readDirFiltered(path);
        return folders;
    }
}
