import { caseType } from '../utils/casing';
import ComponentInterface from './ComponentInterface';

export default class BuiltinComponentInterface extends ComponentInterface {
    constructor(
        baseName: string,
        attributes: any,
        relativeDirectoryPath: string,
        fileCase: caseType,
        prefix = ''
    ) {
        super(
            baseName,
            attributes,
            relativeDirectoryPath,
            'builtins',
            fileCase,
            prefix,
            {
                hasId: false,
                hasComponent: false,
            }
        );
    }

    override updateStrapiName() {
        this.StrapiName = `builtins::${this.BaseName}`;
    }
}
