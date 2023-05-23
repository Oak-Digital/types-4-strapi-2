import { prefixDotSlash } from '../utils';
import { dirname, join, relative } from 'path/posix';
import { caseType, changeCase } from '../utils/casing';

export type RelationNames = Record<string, { name: string; file: File }>;

export abstract class File {
    private Relations: File[] = []; // Components and relations
    protected RelationNames: RelationNames = {};
    private RelationNamesCounter: Record<string, number> = {};
    protected BaseName: string;
    protected StrapiName: string;
    private RelativeDirectoryPath: string;
    protected FileCase: caseType;

    constructor(
        baseName: string,
        relativeDirectoryPath: string,
        fileCaseType: caseType = 'pascal'
    ) {
        this.BaseName = baseName;
        this.StrapiName = '';
        this.FileCase = fileCaseType;
        this.RelativeDirectoryPath = relativeDirectoryPath;
    }

    abstract getDependencies(): string[];
    abstract getStrapiName(): string;
    abstract getFullName(): string;
    abstract toString(): string;

    setRelations(relations: File[]) {
        this.Relations = relations;
        this.RelationNames = {};
        this.RelationNamesCounter = {};
        this.Relations.forEach((file) => {
            let name = file.getFullName();
            // FIXME: clean up this mess...
            if (file.getStrapiName() !== this.getStrapiName()) {
                // Avoid duplicate names
                if (name in this.RelationNamesCounter) {
                    name += ++this.RelationNamesCounter[name];
                } else {
                    this.RelationNamesCounter[name] = 0;
                }
            }
            this.RelationNames[file.getStrapiName()] = { name, file };
        });
    }

    // For typescript import from index file
    getRelativeRootPath() {
        const path = join(this.RelativeDirectoryPath, this.getFileBaseName());
        return prefixDotSlash(path);
    }

    getBaseName() {
        return this.BaseName;
    }

    getRelativeRootPathFile() {
        return `${this.getRelativeRootPath()}.ts`;
    }

    getRelativeRootDir() {
        const path = dirname(this.getRelativeRootPathFile());
        return path;
    }

    getFileBaseName() {
        return changeCase(this.getBaseName(), this.FileCase);
    }

    protected getTsImports() {
        return Object.keys(this.RelationNames)
            .map((strapiName: string) => {
                if (strapiName === this.getStrapiName()) {
                    return '';
                }
                const relationName = this.RelationNames[strapiName].name;
                const inter = this.RelationNames[strapiName].file;
                const importPath = prefixDotSlash(
                    relative(
                        this.getRelativeRootDir(),
                        inter.getRelativeRootPath()
                    )
                );
                const fullName = inter.getFullName();
                const importNameString =
                    fullName === relationName
                        ? fullName
                        : `${fullName} as ${relationName}`;
                return `import { ${importNameString} } from '${importPath}';`;
            })
            .filter((s) => s)
            .join('\n');
    }
}
