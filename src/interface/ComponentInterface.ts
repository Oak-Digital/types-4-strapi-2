import Interface from "./Interface";

export default class ComponentInterface extends Interface {
    protected Category: string;

    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, category: string, prefix: string = "") {
        super(baseName, attributes, relativeDirectoryPath, prefix);
        this.Category = category;
        // this.Attributes.id = {
        //     type: "number", // Components have a id field with a number
        //     required: true,
        // };
        this.updateStrapiName();
    }

    updateStrapiName() {
        this.StrapiName = `${this.Category}.${this.getBaseName()}`
    }

    getInterfaceFieldsString() {
        const attrs = this.getAttributes();
        let str = "    id: number;\n";
        return str + attrs.toFieldsString();
    }
}
