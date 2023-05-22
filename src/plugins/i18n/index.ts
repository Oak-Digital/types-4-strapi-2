import { CERTAINLY_REQUIRED_KEY } from '../../constants';
import { Events } from '../../events';
import { HookTypes } from '../PluginManager';
import { PluginRegister } from '../types';

const addLocaleToLocalizedContentTypes: HookTypes['AfterReadSchema'] = (
    state,
    { apiSchemas }
) => {
    apiSchemas.forEach(({ name, schema }) => {
        const { attributes } = schema;
        if (schema?.pluginOptions?.i18n?.localized !== true) {
            return;
        }
        // Add locale to all localized content types
        attributes.locale = {
            type: 'string',
            required: true,
            [CERTAINLY_REQUIRED_KEY]: true,
        };
        // Add populatable field for localizations
        attributes.localizations = {
            type: 'relation',
            relation: 'oneToMany',
            target: `api::${name}.${name}`, // TODO: make this more complete
        };
    });
};

const register: PluginRegister = () => {
    return {
        [Events.AfterReadSchema]: [
            {
                fn: addLocaleToLocalizedContentTypes,
                priority: 10,
            },
        ],
    };
};

export default register;
