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
import { AttributeWithNested } from './builtinInterfaces';
import { Namespace } from '../readers/types/content-type-reader';

export default class Interface extends File {
    protected NamePrefix = '';
    protected Attributes: Record<string, AttributeWithNested>;
    protected CollectionName: string | null;
    protected Namespace: Namespace;

    constructor(
        baseName: string,
        namespace: Namespace,
        attributes: Record<string, AttributeWithNested>,
        relativeDirectoryPath: string,
        collectionName: string | null = null,
        fileCaseType: caseType = 'pascal',
        prefix = ''
    ) {
        super(baseName, join(namespace, relativeDirectoryPath), fileCaseType);
        this.CollectionName = collectionName;
        this.Namespace = namespace;
        this.updateStrapiName();
        this.NamePrefix = prefix;
        this.Attributes = attributes;

        if (!attributes) {
            console.warn(
                `Warning: attributes for ${this.getStrapiName()} is empty!`
            );
        }
    }

    protected updateStrapiName() {
        const collectionString = this.CollectionName
            ? `${this.CollectionName}.`
            : '';
        this.StrapiName = `${this.Namespace}::${collectionString}${this.BaseName}`;
    }

    getStrapiName() {
        return this.StrapiName;
    }

    getDependencies() {
        return this.getAttributes().getDependencies();
    }

    getFullName() {
        let name;
        if (this.Namespace === 'admin') {
            name = `Admin${this.BaseName}`;
        } else if (this.CollectionName === null) {
            name = this.BaseName;
        } else if (this.CollectionName === this.BaseName) {
            name = this.BaseName;
        } else {
            name = this.StrapiName.split('::').pop();
        }

        // TODO: use correct casing from options
        const pascalName = pascalCase(name);
        const fullName = `${this.NamePrefix}${pascalName}`;
        return fullName;
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
                `${this.RelationNames['builtins::ExtractFlat'].name}<${POPULATE_GENERIC_NAME}>`
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
