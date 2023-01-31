import { dirname, join, relative } from 'path/posix';
import { caseType, changeCase } from '../utils/casing';
import { prefixDotSlash } from '../utils';
import Attributes from '../attributes/Attributes';
import {
    camelCase,
    pascalCase,
    dotCase,
    snakeCase,
    capitalCase,
    constantCase,
    paramCase,
} from 'change-case';
import { POPULATE_GENERIC_NAME } from '../constants';
import { File } from '../file/File';

export default class Interface extends File {
    private NamePrefix = '';
    protected Attributes: any;

    constructor(
        baseName: string,
        attributes: any,
        relativeDirectoryPath: string,
        fileCaseType: caseType = 'pascal',
        prefix = ''
    ) {
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

    getAttributes(): Attributes {
        return new Attributes(this.Attributes, this.RelationNames);
    }

    attributesToString() {
        const attrs = this.getAttributes();
        return attrs.toString();
    }

    getInerfaceString() {
        const isPopulatable = this.hasPopulatableAttributes();
        /* const populateString = isPopulatable ? `<${POPULATE_GENERIC_NAME} extends string | never = never>` : ''; */
        const strArr = [`export interface ${this.getFullName()}`];

        if (isPopulatable) {
            strArr.push(
                `<${POPULATE_GENERIC_NAME} extends string | never = never>`
            );
        }
        strArr.push(' {\n');
        strArr.push(this.getInterfaceFieldsString());
        strArr.push('}');

        const str = strArr.join('');
        return str;
    }

    getInterfaceFieldsString() {
        const populatable = this.hasPopulatableAttributes();
        const strArr = [];
        strArr.push('id: number;\n');
        strArr.push(`attributes: `);
        if (populatable) {
            strArr.push(`RequiredBy<`);
        }
        strArr.push(`${this.attributesToString()}`);
        if (populatable) {
            // The comma for required by
            strArr.push(', ');
            // second generic for required by
            strArr.push(
                `${
                    this.RelationNames['builtins::ExtractFlat'].name
                }<${POPULATE_GENERIC_NAME}>`
            );
            // close the required by
            strArr.push('>');
        }
        strArr.push(`\n`);

        return strArr.join('');
    }

    toString() {
        const strings = [this.getTsImports(), this.getInerfaceString()];
        return strings.join('\n');
    }
}
