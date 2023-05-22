import { CERTAINLY_REQUIRED_KEY } from '../../constants';
import { Events } from '../../events';
import { HookTypes } from '../PluginManager';
import { PluginRegister } from '../types';

const addLocaleToLocalizedContentTypes: HookTypes['AfterReadSchema'] = (
    state,
    { apiSchemas }
) => {

    Object.entries(apiSchemas).forEach(([strapiName, schema]) => {
        const { attributes } = schema.contentType;
        if (schema.contentType?.pluginOptions?.i18n?.localized !== true) {
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
            target: strapiName
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
