import { dirname, join, relative } from 'path/posix';
import { caseType, changeCase } from '../case';
import { prefixDotSlash } from '../utils';
import Attributes from './Attributes';
import { camelCase, pascalCase, dotCase, snakeCase, capitalCase, constantCase, paramCase } from 'change-case';

export type RelationNames = Record<string, { name: string, inter: Interface }>;

export default class Interface {
    protected BaseName: string;
    private Relations: Interface[] = []; // Components and relations
    private RelationNames: RelationNames = {};
    private RelationNamesCounter: Record<string, number> = {};
    private NamePrefix = '';
    protected Attributes: any;
    private RelativeDirectoryPath: string;
    protected StrapiName: string;
    protected FileCase: caseType;

    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, fileCaseType : caseType = 'pascal', prefix = '') {
        this.BaseName = baseName;
        this.updateStrapiName();
        this.NamePrefix = prefix;
        this.Attributes = attributes;
        this.RelativeDirectoryPath = relativeDirectoryPath;
        this.FileCase = fileCaseType;
    }

    protected updateStrapiName() {
        this.StrapiName = `api::${this.BaseName}.${this.BaseName}`;
    }

    getBaseName() {
        return this.BaseName;
    }

    getStrapiName() {
        return this.StrapiName;
    }

    getDependencies() {
        const attrs = new Attributes(this.Attributes, this.RelationNames);
        return attrs.getDependencies();
    }

    getFullInterfaceName() {
        const pascalName = pascalCase(this.BaseName);
        return `${this.NamePrefix}${pascalName}`;
    }

    getFileBaseName() {
        return changeCase(this.getBaseName(), this.FileCase);
    }

    // For typescript import from index file
    getRelativeRootPath() {
        const path = join(this.RelativeDirectoryPath, this.getFileBaseName());
        return prefixDotSlash(path);
    }

    getRelativeRootDir() {
        const path = dirname(this.getRelativeRootPathFile());
        return path;
    }

    getRelativeRootPathFile() {
        return `${this.getRelativeRootPath()}.ts`;
    }

    setRelations(relations: Interface[]) {
        this.Relations = relations;
        this.RelationNames = {};
        this.Relations.forEach((inter: Interface) => {
            let name = inter.getFullInterfaceName();
            // FIXME: clean up this mess...
            if (inter.getStrapiName() !== this.getStrapiName()) {
                // Avoid duplicate names
                if (name in this.RelationNamesCounter) {
                    name += ++this.RelationNamesCounter[name];
                } else {
                    this.RelationNamesCounter[name] = 0;
                }
            }
            this.RelationNames[inter.getStrapiName()] = { name, inter };
        });
    }

    private getTsImports() {
        return Object.keys(this.RelationNames).map((strapiName: string) => {
            if (strapiName === this.getStrapiName()) {
                return '';
            }
            const relationName = this.RelationNames[strapiName].name;
            const inter = this.RelationNames[strapiName].inter;
            const importPath = prefixDotSlash(relative(this.getRelativeRootDir(), inter.getRelativeRootPath()));
            const fullName = inter.getFullInterfaceName();
            const importNameString = fullName === relationName ? fullName : `${fullName} as ${relationName}`;
            return `import { ${importNameString} } from '${importPath}';`;
        }).filter(s => s).join('\n');
    }

    getAttributes() : Attributes {
        return new Attributes(this.Attributes, this.RelationNames);
    }

    attributesToString() {
        const attrs = this.getAttributes();
        return attrs.toString();
    }

    getInerfaceString() {
        let str = `export interface ${this.getFullInterfaceName()} {\n`;
        str += this.getInterfaceFieldsString();
        str += '}';
        return str;
    }

    getInterfaceFieldsString() {
        let str = '';
        str += 'id: number;\n';
        str += `attributes: ${this.attributesToString()}\n`;
        return str;
    }

    toString() {
        const strings = [
            this.getTsImports(),
            this.getInerfaceString()
        ];
        return strings.join('\n');
    }
}
