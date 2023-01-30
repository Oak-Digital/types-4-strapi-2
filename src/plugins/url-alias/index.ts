import { Events, SchemasType } from '../../events';
import InterfaceManager from '../../program/InterfaceManager';
import { HooksType } from '../PluginManager';

const addUrlAliasToAllContentTypes = (
    state: InterfaceManager,
    { apiSchemas }: SchemasType
) => {
    apiSchemas.forEach((schema) => {
        const { attributes } = schema;
        attributes.url_path = {
            type: 'string',
            required: true,
        };
        // console.log('updated schema', schema)
        // TODO: add this with possibly undefined instead of null
        // attributes.url_path_id = {
        //     type: 'string',
        // };
    });
};

const register = (): Partial<HooksType> => {
    return {
        [Events.AfterReadSchema]: [
            {
                fn: addUrlAliasToAllContentTypes,
                priority: 10,
            },
        ],
    };
};

export default register;
