import EventEmitter from 'events';
import { Events, SchemasType } from '../../events';

const addUrlAliasToAllContentTypes = ({ apiSchemas }: SchemasType) => {
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

const register = (eventEmitter: EventEmitter) => {
    eventEmitter.on(Events.AfterReadSchema, addUrlAliasToAllContentTypes);
};

export default register;
