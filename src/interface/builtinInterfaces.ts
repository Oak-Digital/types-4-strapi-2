import BuiltinComponentInterface from "./BuiltinComponentInterface";
import BuiltinInterface from "./BuiltinInterface";

export function createMediaInterface(directory: string, prefix: string) {
    const stringFields = [
        "name",
        "alternativeText",
        "caption",
        "hash",
        "ext",
        "mime",
        "url",
        "previewUrl",
        "provider",
    ];
    const numberFields = [
        "width",
        "height",
        "size",
    ];
    const mediaFormat = {
        type: "component",
        repeatable: false,
        component: "builtins::MediaFormat",
    };
    const mediaAttrs = {
        formats: {
            // types-4-strapi-2 specific
            type: "nested",
            fields: {
                thumbnail: mediaFormat,
                medium: mediaFormat,
                small: mediaFormat,
            },
        },
    };

    stringFields.forEach(s => mediaAttrs[s] = { type: "string" })
    numberFields.forEach(s => mediaAttrs[s] = { type: "integer" })
    // const dataAttrs = {
    //     data: {
    //         type: "nested",
    //         fields: mediaAttrs,
    //         nullable: true,
    //     },
    // };
    return new BuiltinInterface("Media", mediaAttrs, directory, prefix)
}

export function createMediaFormatInterface(directory: string, prefix: string) {
    const stringFields = [
        "name",
        "hash",
        "ext",
        "mime",
        "path",
        "url",
    ];
    const numberFields = [
        "width",
        "height",
        "size",
    ];
    const mediaAttrs = {};

    stringFields.forEach(s => mediaAttrs[s] = { type: "string" })
    numberFields.forEach(s => mediaAttrs[s] = { type: "integer" })
    return new BuiltinComponentInterface("MediaFormat", mediaAttrs, directory, prefix)
}
