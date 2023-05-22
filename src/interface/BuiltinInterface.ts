import { caseType } from '../utils/casing';
import Interface from './Interface';

export default class BuiltinInterface extends Interface {
    constructor(
        baseName: string,
        attributes: any,
        relativeDirectoryPath: string,
        fileCase: caseType,
        prefix = ''
    ) {
        super(baseName, 'builtins', attributes, relativeDirectoryPath, null, fileCase, prefix);
    }
}
