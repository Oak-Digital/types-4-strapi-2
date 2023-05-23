import { File } from '../../file/File';

export interface InterfaceWriter {
    write(data: File[]): Promise<void>;
}
