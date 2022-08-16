import ComponentInterface from './ComponentInterface';

export default class BuiltinComponentInterface extends ComponentInterface {
    constructor(baseName: string, attributes: any, relativeDirectoryPath: string, prefix = '') {
        super(baseName, attributes, relativeDirectoryPath, 'builtins', prefix, {
            hasId: false,
            hasComponent: false,
        });
    }

    override updateStrapiName() {
        this.StrapiName = `builtins::${this.BaseName}`;
    }
}
