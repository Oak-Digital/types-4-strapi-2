import Interface from "./Interface";

export default class BuiltinInterface extends Interface {
    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, prefix: string = "") {
        super(baseName, attributes, relativeDirectoryPath, prefix);
    }

    override updateStrapiName() {
        this.StrapiName = `builtins::${this.BaseName}`;
    }
}
