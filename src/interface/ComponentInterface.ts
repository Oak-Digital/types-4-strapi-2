import { POPULATE_GENERIC_NAME } from '../constants';
import { caseType } from '../utils/casing';
import Interface from './Interface';

export default class ComponentInterface extends Interface {
    protected Category: string;
    protected Options: Record<string, any> = {
        hasId: true,
        hasComponent: true,
    };

    constructor(
        baseName: string,
        attributes: any,
        relativeDirectoryPath: string,
        category: string,
        fileCase: caseType,
        prefix = '',
        options: Record<string, any> = {}
    ) {
        // TODO: Component interface doesn't really make sense to extend from Interface, but it works for now.
        //       we should transition to use composition instead of this type of inheritance
        super(
            baseName,
            'api',
            attributes,
            relativeDirectoryPath,
            category,
            fileCase,
            prefix
        );
        this.Category = category;
        // this.Attributes.id = {
        //     type: "number", // Components have a id field with a number
        //     required: true,
        // };
        this.updateStrapiName();
        Object.assign(this.Options, options);
    }

    updateStrapiName() {
        this.StrapiName = `${this.Category}.${this.getBaseName()}`;
    }

    // TODO: make this more dynamic in parent
    override getInerfaceString() {
        const isPopulatable = this.hasPopulatableAttributes();
        /* const populateString = isPopulatable ? `<${POPULATE_GENERIC_NAME} extends string | never = never>` : ''; */
        const strArr = [];

        if (isPopulatable) {
            strArr.push(`export type ${this.getFullName()}`);
        } else {
            strArr.push(`export interface ${this.getFullName()}`);
        }

        if (isPopulatable) {
            strArr.push(
                `<${POPULATE_GENERIC_NAME} extends string | never = never>`
            );
            strArr.push(
                ` = ${this.RelationNames['builtins::RequiredBy'].name}<`
            );
        }
        strArr.push(' {\n');
        strArr.push(this.getInterfaceFieldsString());
        strArr.push('}');

        if (isPopulatable) {
            strArr.push(', ');
            strArr.push(this.RelationNames['builtins::ExtractFlat'].name);
            // extract flat start
            strArr.push('<');
            strArr.push(POPULATE_GENERIC_NAME);
            // extract flat end
            strArr.push('>');
            // required by end
            strArr.push('>');
        }

        const str = strArr.join('');
        return str;
    }

    getInterfaceFieldsString() {
        const attrs = this.getAttributes();
        let str = '';
        const { hasId, hasComponent } = this.Options;
        if (hasId) {
            str += '  id: number;\n';
        }
        if (hasComponent) {
            str += `  __component: "${this.getStrapiName()}";\n`;
        }
        return str + attrs.toFieldsString();
    }
}
