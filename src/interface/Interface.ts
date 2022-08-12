import { join, parse, relative } from "path";
import Attributes from "./Attributes";

export default class Interface {
    private BaseName: string;
    private Relations: Interface[] = []; // Components and relations
    private RelationNames: Record<string, [string, Interface]> = {};
    private RelationNamesCounter: Record<string, number> = {};
    private NamePrefix: string = "";
    private Attributes: any;
    private RelativeDirectoryPath: string;
    private StrapiName: string;

    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, prefix: string = "") {
        this.BaseName = baseName;
        this.StrapiName = `api::${baseName}.${baseName}`;
        this.NamePrefix = prefix;
        this.Attributes = attributes;
        this.RelativeDirectoryPath = relativeDirectoryPath;
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
        return `${this.NamePrefix}${this.BaseName}`;
    }

    // For typescript import from index file
    getRelativeRootPath() {
        const path = join(this.RelativeDirectoryPath, this.getBaseName());
        const relativePath = (/^\.?\.\//).test(path) ? path : "./" + path;
        return relativePath;
    }

    getRelativeRootPathFile() {
        return `${this.getRelativeRootPath()}.ts`
    }

    setRelations(relations: Interface[]) {
        this.Relations = relations;
        this.RelationNames = {};
        this.Relations.forEach((inter: Interface) => {
            let name = inter.getBaseName();
            // Avoid duplicate names
            if (name in this.RelationNamesCounter) {
                name += ++this.RelationNamesCounter[name];
            } else {
                this.RelationNamesCounter[name] = 0;
            }
            this.RelationNames[inter.getStrapiName()] = [name, inter];
        })
    }

    private getTsImports() {
        return Object.keys(this.RelationNames).map((strapiName: string) => {
            const relationName = this.RelationNames[strapiName][0];
            const inter = this.RelationNames[strapiName][1];
            const importPath = relative(this.getRelativeRootPath(), inter.getRelativeRootPath());
            const fullName = inter.getFullInterfaceName();
            const importNameString = fullName === relationName ? fullName : `${fullName} as ${relationName}`;
            return `import { ${importNameString} } from '${importPath}';`;
        }).join("\n");
    }

    attributesToString() {
        let str = '';
        for (const attributeName in this.Attributes) {
            const attr = this.Attributes[attributeName];
            switch (attr.type) {
                default:
                    
                    break;
            }
        }
    }

    getInerfaceString() {
        let str = 'export interface ${this.getFullInterfaceName()} {\n';
        str += this.getInterfaceFieldsString();
        str += `}`
        return str;
    }

    getInterfaceFieldsString() {
        let str: string;
        str += `  id: number;\n`;
        str += `  attributes: ${this.attributesToString()}\n`;
        return str;
    }

    toString() {
        return this.getTsImports() + this.getInerfaceString();
    }
}
