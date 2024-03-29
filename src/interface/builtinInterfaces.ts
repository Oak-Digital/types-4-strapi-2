import { z } from 'zod';
import { CERTAINLY_REQUIRED_KEY } from '../constants';
import { attribute, contentTypeAttribute } from '../readers/types/attributes';
import { caseType } from '../utils/casing';
import BuiltinComponentInterface from './BuiltinComponentInterface';
import BuiltinInterface from './BuiltinInterface';

export const nestedAttribute = z.object({
    type: z.literal('nested'),
    nullable: z.boolean().optional(),
    fields: z.record(contentTypeAttribute),
});

export const attributeWithNested = z.union([contentTypeAttribute, nestedAttribute]);
export type AttributeWithNested = z.infer<typeof attributeWithNested>;

export function createMediaInterface(
    caseTypeName: caseType,
    prefix: string
) {
    const stringRequiredFields = [
        'name',
        'hash',
        'ext',
        'mime',
        'url',
        'provider',
    ];
    const stringFields = [
        'previewUrl',
        'provider_metadata',
        'alternativeText', // nullable in plain text
        'caption', // nullable in plain text
    ];
    const numberRequiredFields = ['size'];
    // Nullable if you have a plain text file
    const numberFields = ['width', 'height'];
    const mediaFormat = {
        type: 'component',
        repeatable: false,
        component: 'builtins::MediaFormat',
    } as const;
    const mediaAttrs: Record<string, AttributeWithNested> = {
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
        mediaAttrs[s] = {
            type: 'text',
            required: true,
            [CERTAINLY_REQUIRED_KEY]: true,
        };
    });
    stringFields.forEach((s) => {
        mediaAttrs[s] = { type: 'text' };
    });
    numberFields.forEach((s) => {
        mediaAttrs[s] = { type: 'integer' };
    });
    numberRequiredFields.forEach((s) => {
        mediaAttrs[s] = {
            type: 'integer',
            required: true,
            [CERTAINLY_REQUIRED_KEY]: true,
        };
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
        '',
        caseTypeName,
        prefix
    );
}

export function createMediaFormatInterface(
    caseTypeName: caseType,
    prefix: string
) {
    const stringRequiredFields = ['name', 'hash', 'ext', 'mime', 'url'];
    const stringFields = ['path'];
    const numberRequiredFields = ['size', 'width', 'height']; // TODO: not sure if this is corrext
    const numberFields = [];
    const mediaAttrs = {};

    stringRequiredFields.forEach((s) => {
        mediaAttrs[s] = {
            type: 'string',
            required: true,
            [CERTAINLY_REQUIRED_KEY]: true,
        };
    });
    stringFields.forEach((s) => {
        mediaAttrs[s] = { type: 'string' };
    });
    numberRequiredFields.forEach((s) => {
        mediaAttrs[s] = {
            type: 'integer',
            required: true,
            [CERTAINLY_REQUIRED_KEY]: true,
        };
    });
    numberFields.forEach((s) => {
        mediaAttrs[s] = { type: 'integer' };
    });
    return new BuiltinComponentInterface(
        'MediaFormat',
        mediaAttrs,
        '',
        caseTypeName,
        prefix
    );
}
