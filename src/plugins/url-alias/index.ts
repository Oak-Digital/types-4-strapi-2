import { Events, SchemasType } from '../../events';
import InterfaceManager from '../../program/InterfaceManager';
import { HooksType, HookTypes } from '../PluginManager';
import { PluginRegister } from '../types';
import { UrlAliasGet } from './type';

const addUrlAliasToAllContentTypes: HookTypes['AfterReadSchema'] = (
    state: InterfaceManager,
    { apiSchemas }: SchemasType
) => {
    apiSchemas.forEach(({ name, schema }) => {
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

const addUrlAliasGetType = (state: InterfaceManager) => {
    const urlAliasGet = new UrlAliasGet();
    state.addType(urlAliasGet.getStrapiName(), urlAliasGet);
};

const register: PluginRegister = () => {
    return {
        [Events.AfterReadSchema]: [
            {
                fn: addUrlAliasToAllContentTypes,
                priority: 10,
            },
        ],
        [Events.AfterReadSchemas]: [
            {
                fn: addUrlAliasGetType,
                priority: 10,
            },
        ],
    };
};

export default register;
