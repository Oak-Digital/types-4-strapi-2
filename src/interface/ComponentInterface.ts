import { prefixDotSlash } from "../utils";
import Interface from "./Interface";

export default class ComponentInterface extends Interface {
    protected Category: string;

    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, category: string, prefix: string = "") {
        super(baseName, attributes, relativeDirectoryPath, prefix);
        this.Category = category;
        this.updateStrapiName();
    }

    updateStrapiName() {
        this.StrapiName = `${this.Category}.${this.getBaseName()}`
    }
}
