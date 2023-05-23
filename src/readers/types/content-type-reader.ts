import { StrapiComponent } from './component';
import { StrapiContentType } from './content-type';

export type Namespace = 'api' | 'plugin' | 'admin' | 'builtins';

export interface ContentTypeReader {
    readContentTypes(): Promise<
        Record<
            `${Namespace}::${string}`,
            {
                name: string;
                contentType: StrapiContentType;
            } & (
                | {
                    namespace: 'api' | 'plugin';
                    collection: string;
                }
                | {
                    namespace: 'admin';
                    collection?: null | undefined;
                }
            )
        >
    >;

    readComponents(): Promise<Record<`${string}.${string}`, StrapiComponent>>;
}
