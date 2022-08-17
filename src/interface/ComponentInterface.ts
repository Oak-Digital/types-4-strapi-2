import { caseType } from '../case';
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
        super(baseName, attributes, relativeDirectoryPath, fileCase, prefix);
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
