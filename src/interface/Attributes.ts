import Interface from "./Interface";

export default class Attributes {
    Attrs: Record<string, Record<string, any>>;
    private RelationNames: Record<string, [string, Interface]> = {};

    constructor(attr: Record<string, Record<string, any>>, relationNames: Record<string, [string, Interface]>) {
        this.Attrs = attr;
        this.RelationNames = relationNames;
    }

    isAttributeOptional(attr: any) {
        // If it is a component / relation / dynamiczone it is always optional due to population
        switch (attr.type) {
            case "component":
            case "dynamiczone":
            case "relation":
                return false;
            default:
                break;
        }

        return attr.required !== true;
    }

    getDependencies() {
        const dependencies = [];
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            let dependencyName : string;
            switch (attr.type) {
                case "relation":
                    dependencyName = attr.target;
                    break;
                case "component":
                    dependencyName = attr.component;
                    break;
                default:
                    continue;
            }
            dependencies.push(dependencyName);
        }
        return dependencies;
    }

    attributeToString(attrName: string, attr: any) {
        let optionalString = this.isAttributeOptional(attr) ? '?' : '';
        let str = `${attrName}${optionalString}: `
        let isArray : boolean = false;
        switch (attr.type) {
            case "relation":
                const apiName = attr.target;
                const dependencyName = this.RelationNames[apiName][0];
                isArray = attr.relation.endsWith("ToMany");
                str += dependencyName;
                break;
            case "component":
                const componentName = attr.component;
                const dependencyComponentName = this.RelationNames[componentName][0];
                isArray = attr.repeatable ?? false;
                str += dependencyComponentName;
                break;
            case "password":
                return null;
            case "string":
            case "text":
            case "richtext":
            case "email":
            case "uid":
                str += "string";
                break;
            case "integer":
            case "biginteger":
            case "decimal":
            case "float":
                str += "number";
                break;
            case "date":
            case "datetime":
            case "time":
                str += "Date";
                break;
            case "boolean":
                str += attr.type;
            case "json":
            default:
                str += "any";
                break;
        }
        const isArrayString = isArray ? '[]' : ''
        str += `${isArrayString};`;
        return str;
    }

    toString() : string {
        const strings = [ "{" ];
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            const attrString = this.attributeToString(attrName, attr);
            if (attrString === null) {
                continue;
            }
            strings.push(attrString)
        }
        strings.push("}")
        return strings.join("\n");
    }
}
