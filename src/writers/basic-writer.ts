import { mkdir, rm, writeFile } from 'fs/promises';
import { join, dirname } from 'path/posix';
import { Interface } from 'readline';
import { File } from '../file/File';
import { InterfaceWriter } from './types/writer';
import prettier from 'prettier';

type BasicWriterOptions = {
    /**
     * Warning: this will delete all files in the output directory!
     * @default false
     * @type {boolean}
     */
    deleteOld?: boolean;
    prettierOptions?: prettier.Options;
    indexFile?: boolean;
};

export class BasicWriter implements InterfaceWriter {
    protected OutRootPath: string;
    private DeleteOld: boolean;
    private PrettierOptions: prettier.Options;
    private IndexFile: boolean;

    constructor(
        outRootPath: string,
        {
            deleteOld = false,
            indexFile = true,
            prettierOptions = { parser: 'typescript' },
        }: BasicWriterOptions
    ) {
        this.OutRootPath = outRootPath;
        this.DeleteOld = deleteOld;
        this.IndexFile = indexFile;
        this.PrettierOptions = prettierOptions;
    }

    async write(data: File[]) {
        if (this.DeleteOld) {
            await rm(this.OutRootPath, { recursive: true, force: true });
        }
        // make folders
        await this.makeFolders(data);

        // write files
        const promises = data.map(async (file) => {
            const fileData = file.toString();
            const formattedFileData = prettier.format(
                fileData,
                this.PrettierOptions
            );
            const filePath = join(
                this.OutRootPath,
                file.getRelativeRootPathFile()
            );
            await mkdir(dirname(filePath), {
                recursive: true,
            });
            await writeFile(filePath, formattedFileData);
        });

        if (this.IndexFile) {
            await this.writeIndexFile(data);
        }

        await Promise.all(promises);
    }

    async writeIndexFile(data: File[]) {
        const strings = data.map((inter) => {
            return `export * from '${inter.getRelativeRootPath()}'`;
        });
        const fileData = strings.join('\n');
        const formattedFileData = prettier.format(
            fileData,
            this.PrettierOptions
        );
        const filePath = join(this.OutRootPath, 'index.ts');
        await writeFile(filePath, formattedFileData);
    }

    async makeFolders(data: File[]) {
        const folderPaths = new Set<string>();
        data.map((file) => {
            const filePath = join(
                this.OutRootPath,
                file.getRelativeRootPathFile()
            );

            const folderPath = dirname(filePath);

            folderPaths.add(folderPath);
        });

        const promises = Array.from(folderPaths).map((folderPath) => {
            return mkdir(folderPath, { recursive: true });
        });

        await Promise.all(promises);
    }
}
