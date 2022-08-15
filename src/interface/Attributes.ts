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
                return true;
            default:
                break;
        }

        return false;
    }

    getDependencies(strapiName: string) {
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
            // // If the current dependency is the interface itself, do not report it as a dependency
            // if (dependencyName === strapiName) {
            //     continue;
            // }
            dependencies.push(dependencyName);
        }
        return dependencies;
    }

    attributeToString(attrName: string, attr: any) {
        let optionalString = this.isAttributeOptional(attr) ? '?' : '';
        let str = `    ${attrName}${optionalString}: `
        let isArray : boolean = false;
        switch (attr.type) {
            case "relation":
                const apiName = attr.target;
                // console.log(attrName)
                // console.log(this.RelationNames, apiName)
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
            case "enumeration":
                const hasDefault = "default" in attr;
                const enums = attr.enum.map((en: string) => `"${en}"`)
                enums.push("null")
                const typeString = enums.join(" | ");
                str += typeString;
                break;
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
                break;
            case "json":
            default:
                str += "any";
                break;
        }
        const isArrayString = isArray ? '[]' : ''
        str += `${isArrayString};`;
        return str;
    }

    toFieldsString() : string {
        const strings = [];
        for (const attrName in this.Attrs) {
            const attr = this.Attrs[attrName];
            const attrString = this.attributeToString(attrName, attr);
            if (attrString === null) {
                continue;
            }
            strings.push(attrString)
        }
        return strings.map(s => `${s}\n`).join("");
    }

    toString() : string {
        const strings = [ "{" ];
        strings.push(this.toFieldsString());
        strings.push("}")
        return strings.join("\n");
    }
}
