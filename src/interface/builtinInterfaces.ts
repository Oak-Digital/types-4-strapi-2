import { caseType } from '../case';
import BuiltinComponentInterface from './BuiltinComponentInterface';
import BuiltinInterface from './BuiltinInterface';

export function createMediaInterface(
    directory: string,
    caseTypeName: caseType,
    prefix: string
) {
    const stringRequiredFields = [
        'name',
        'alternativeText',
        'caption',
        'hash',
        'ext',
        'mime',
        'url',
        'provider',
    ];
    const stringFields = ['previewUrl', 'provider_metadata'];
    const numberFields = ['width', 'height', 'size'];
    const mediaFormat = {
        type: 'component',
        repeatable: false,
        component: 'builtins::MediaFormat',
    };
    const mediaAttrs = {
        formats: {
            // types-4-strapi-2 specific
            type: 'nested',
            nullable: true,
            fields: {
                thumbnail: mediaFormat,
                large: mediaFormat,
                medium: mediaFormat,
                small: mediaFormat,
            },
        },
    };

    stringRequiredFields.forEach((s) => {
        mediaAttrs[s] = { type: 'string', required: true };
    });
    stringFields.forEach((s) => {
        mediaAttrs[s] = { type: 'string' };
    });
    numberFields.forEach((s) => {
        mediaAttrs[s] = { type: 'integer', required: true };
    });
    // const dataAttrs = {
    //     data: {
    //         type: "nested",
    //         fields: mediaAttrs,
    //         nullable: true,
    //     },
    // };
    return new BuiltinInterface(
        'Media',
        mediaAttrs,
        directory,
        caseTypeName,
        prefix
    );
}

export function createMediaFormatInterface(
    directory: string,
    caseTypeName: caseType,
    prefix: string
) {
    const stringRequiredFields = ['name', 'hash', 'ext', 'mime', 'url'];
    const stringFields = ['path'];
    const numberFields = ['width', 'height', 'size'];
    const mediaAttrs = {};

    stringRequiredFields.forEach((s) => {
        mediaAttrs[s] = { type: 'string', required: true };
    });
    stringFields.forEach((s) => {
        mediaAttrs[s] = { type: 'string' };
    });
    numberFields.forEach((s) => {
        mediaAttrs[s] = { type: 'integer', required: true };
    });
    return new BuiltinComponentInterface(
        'MediaFormat',
        mediaAttrs,
        directory,
        caseTypeName,
        prefix
    );
}
