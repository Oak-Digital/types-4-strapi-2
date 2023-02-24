import { CERTAINLY_REQUIRED_KEY } from "../../constants";
import { Events } from "../../events";
import { HookTypes } from "../PluginManager";
import { PluginRegister } from "../types";

const addFieldsToContentTypes: HookTypes['AfterReadSchema'] = (state, schema) => {
    const { apiSchemas } = schema;
    apiSchemas.forEach(({ name, schema }) => {
        const { attributes, options = {} } = schema;
        if (options?.draftAndPublish !== true) {
            return;
        }
        const fieldNames = ['publishedAt', 'createdAt', 'updatedAt'];
        fieldNames.forEach((fieldName) => {
            attributes[fieldName] = {
                type: 'string',
                required: true,
                [CERTAINLY_REQUIRED_KEY]: true,
            };
        });
    });
};

const register: PluginRegister = () => {
    return {
        [Events.AfterReadSchema]: [
            {
                fn: addFieldsToContentTypes,
                priority: 10,
            },
        ],
    };
}

export default register;
