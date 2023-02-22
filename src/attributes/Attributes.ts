import { CERTAINLY_REQUIRED_KEY, POPULATE_GENERIC_NAME } from '../constants';
import { RelationNames } from '../file/File';
import Interface from '../interface/Interface';

export default class Attributes {
    Attrs: Record<string, Record<string, any>>;
    private RelationNames: RelationNames = {};

    constructor(
        attr: Record<string, Record<string, any>>,
        relationNames: RelationNames
    ) {
        this.Attrs = attr;
        this.RelationNames = relationNames;
    }

    isAttributePopulatable(attr: any): boolean {
        // If it is a component / relation / dynamiczone it is always optional due to population
        switch (attr.type) {
            case 'nested':
                // we need to check equality since it could be undefined
                return attr.nullable === true;
            case 'media': // media is also always populatable
            case 'component':
            case 'dynamiczone':
            case 'relation':
                return true;
            default:
                break;
        }

        return false;
    }

    hasPopulatableAttributes() {
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            if (this.isAttributePopulatable(attr)) {
                return true;
            }
        }
        return false;
    }

    getPopulatableAttributes() {
        const populatableAttributes = new Set<string>();
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            if (this.isAttributePopulatable(attr)) {
                populatableAttributes.add(attrName);
            }
        }

        return populatableAttributes;
    }

    getDependencies() {
        const dependencies = new Set<string>();
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            switch (attr.type) {
                case 'nested':
                    const attrs = new Attributes(
                        attr.fields,
                        this.RelationNames
                    );
                    const deps = attrs.getDependencies();
                    deps.forEach((dep) => dependencies.add(dep));
                    break;
                case 'relation':
                    dependencies.add(attr.target);
                    break;
                case 'component':
                    dependencies.add(attr.component);
                    break;
                case 'media':
                    dependencies.add('builtins::Media');
                    break;
                case 'dynamiczone':
                    const componentDeps = attr.components ?? [];
                    componentDeps.forEach((dep) => dependencies.add(dep));
                    break;
                default:
                    continue;
            }
            // // If the current dependency is the interface itself, do not report it as a dependency
            // if (dependencyName === strapiName) {
            //     continue;
            // }
        }

        if (this.hasPopulatableAttributes()) {
            dependencies.add('builtins::ExtractNested');
            dependencies.add('builtins::ExtractFlat');
            dependencies.add('builtins::RequiredBy');
        }

        return Array.from(dependencies);
    }

    attributeToString(attrName: string, attr: any) {
        const isPopulatable = this.isAttributePopulatable(attr);
        const isOptional = isPopulatable;
        const optionalString = isOptional ? '?' : '';
        const orNull = ' | null';
        // TODO: only add this in non paranoid mode
        /* const requiredString = attr.required !== true ? orNull : ''; */
        const requiredString = attr?.[CERTAINLY_REQUIRED_KEY] === true ? '' : orNull;
        let str = `    ${attrName}${optionalString}: `;
        let isArray = false;
        switch (attr.type) {
            // types-4-strapi-2 specific, used for builtin types
            case 'nested':
                // Be careful with recursion
                // console.log(attr);
                const nullableString = attr?.nullable ?? false ? ' | null' : '';
                const newAttrs = new Attributes(
                    attr.fields,
                    this.RelationNames
                );
                str += newAttrs.toString() + nullableString;
                break;
            case 'relation':
                const apiName = attr.target;
                // console.log(this.RelationNames, apiName)
                const dependencyName =
                    this.RelationNames[apiName]?.name ?? 'any';
                const relationMultipleString = attr.relation.endsWith('ToMany')
                    ? '[]'
                    : orNull;
                str += `{ data: `;
                str += dependencyName;
                // TODO: assert correctly
                const relationInterface = this.RelationNames[apiName].file as Interface;
                if (relationInterface.hasPopulatableAttributes()) {
                    str += '<';
                    str += `${this.RelationNames['builtins::ExtractNested'].name}<${POPULATE_GENERIC_NAME}, '${attrName}'>`;
                    str += '>';
                }
                str += relationMultipleString;
                str += `; }`;
                break;
            case 'component':
                const componentName = attr.component;
                const relationNameObj = this.RelationNames[componentName];
                // TODO: assert correctly
                const componentInterface = relationNameObj.file as Interface;
                /* console.log(this.RelationNames); */
                const dependencyComponentName: string = relationNameObj.name;
                /* isArray = attr.repeatable ?? false; */
                isArray = false; // we already handle this here.
                str += dependencyComponentName;
                if (componentInterface.hasPopulatableAttributes()) {
                    str += '<';
                    str += `${this.RelationNames['builtins::ExtractNested'].name}<${POPULATE_GENERIC_NAME}, '${attrName}'>`;
                    str += '>';
                }
                if (attr.repeatable) {
                    str += '[]';
                }
                str += requiredString; // resolves #20. components can be null.
                break;
            case 'media':
                const mediaMultipleString = attr.multiple
                    ? '[]'
                    : requiredString;
                str += `{ data: `;
                str += this.RelationNames['builtins::Media'].name;
                str += mediaMultipleString;
                str += `; }`;
                break;
            case 'password':
                return null;
            case 'enumeration':
                const hasDefault = 'default' in attr;
                const enums = attr.enum.map((en: string) => `"${en}"`);
                enums.push('null');
                const typeString = enums.join(' | ');
                str += typeString;
                break;
            case 'dynamiczone':
                // console.log(attr.components);
                const relations = attr.components.map(
                    (componentName: string) => {
                        const component = this.RelationNames[componentName];
                        // in this context file should always be an interface
                        const file = component.file as Interface;
                        const populatable = file.hasPopulatableAttributes();
                        /* false; */
                        const populatableString = populatable
                            ? `${this.RelationNames[componentName].name}<${this.RelationNames['builtins::ExtractNested'].name}<${POPULATE_GENERIC_NAME}, '${attrName}'>>`
                            : this.RelationNames[componentName].name;
                        return populatableString;
                    }
                );
                // console.log(relations);
                const relationsString = relations.join(' | ');
                // console.log(relationsString);
                str += `Array<${relationsString}>`;
                break;
            case 'string':
            case 'text':
            case 'richtext':
            case 'email':
            case 'uid':
                str += 'string';
                str += requiredString;
                break;
            case 'integer':
            case 'biginteger':
            case 'decimal':
            case 'float':
                str += 'number';
                str += requiredString;
                break;
            case 'date':
            case 'datetime':
            case 'time':
                str += 'string';
                str += requiredString;
                break;
            case 'boolean':
                str += attr.type;
                str += requiredString;
                break;
            case 'json':
            default:
                str += 'any';
                break;
        }
        const isArrayString = isArray ? '[]' : '';
        str += `${isArrayString};`;
        return str;
    }

    toFieldsString(): string {
        const strings = [];
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            const attrString = this.attributeToString(attrName, attr);
            if (attrString === null) {
                continue;
            }
            strings.push(attrString);
        }
        return strings.map((s) => `${s}\n`).join('');
    }

    toString(): string {
        const strings = ['{'];
        strings.push(this.toFieldsString());
        strings.push('}');
        return strings.join('\n');
    }
}
