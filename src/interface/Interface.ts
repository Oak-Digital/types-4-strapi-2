import { dirname, join, relative } from 'path/posix';
import { caseType, changeCase } from '../utils/casing';
import { prefixDotSlash } from '../utils';
import Attributes from '../attributes/Attributes';
import { camelCase, pascalCase, dotCase, snakeCase, capitalCase, constantCase, paramCase } from 'change-case';
import { POPULATE_GENERIC_NAME } from '../constants';
import { File } from '../file/File';

export default class Interface extends File {
    private NamePrefix = '';
    protected Attributes: any;

    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, fileCaseType : caseType = 'pascal', prefix = '') {
        super(baseName, relativeDirectoryPath, fileCaseType);
        this.updateStrapiName();
        this.NamePrefix = prefix;
        this.Attributes = attributes;
    }

    protected updateStrapiName() {
        this.StrapiName = `api::${this.BaseName}.${this.BaseName}`;
    }

    getStrapiName() {
        return this.StrapiName;
    }

    getDependencies() {
        return this.getAttributes().getDependencies();
    }

    getFullName() {
        const pascalName = pascalCase(this.BaseName);
        return `${this.NamePrefix}${pascalName}`;
    }

    hasPopulatableAttributes() {
        return this.getAttributes().hasPopulatableAttributes();
    }

    getAttributes() : Attributes {
        return new Attributes(this.Attributes, this.RelationNames);
    }

    attributesToString() {
        const attrs = this.getAttributes();
        return attrs.toString();
    }

    getInerfaceString() {
        const populateString = this.getAttributes().hasPopulatableAttributes() ? `<${POPULATE_GENERIC_NAME} extends string | never = never>` : '';
        let str = `export interface ${this.getFullName()}${populateString} {\n`;
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
