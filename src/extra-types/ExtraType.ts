import { File } from "../file/File";
import { caseType } from "../utils/casing";

export class ExtraType extends File {
    protected typeString: string;

    constructor(typeString: string, baseName: string, relativeDirectoryPath: string, fileCaseType: caseType = 'pascal') {
        super(baseName, relativeDirectoryPath, fileCaseType);
        this.typeString = typeString;
        this.updateStrapiName();
    }

    getDependencies() {
        return [];
    }

    getStrapiName() {
        return this.StrapiName;
    }

    getFullName() {
        return this.BaseName;
    }

    protected updateStrapiName() {
        this.StrapiName = `builtins::${this.BaseName}`;
    }

    toString() {
        // TODO: make this more dynamic
        return `export ${this.typeString}`;
    }
}
