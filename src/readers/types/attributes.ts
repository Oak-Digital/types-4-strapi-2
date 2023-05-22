import { z } from 'zod';
import { CERTAINLY_REQUIRED_KEY } from '../../constants';

export const baseAttribute = z.object({
    pluginOptions: z.any(),
    required: z.boolean().optional(),
    [CERTAINLY_REQUIRED_KEY]: z.boolean().optional(),
});

export const textAttribute = baseAttribute.extend({
    type: z.enum(['text', 'string'])
});

export type TextAttribute = z.infer<typeof textAttribute>;

export const emailAttribute = baseAttribute.extend({
    type: z.literal('email'),
});

export type EmailAttribute = z.infer<typeof emailAttribute>;

export const uidAttribute = baseAttribute.extend({
    type: z.literal('uid'),
    targetField: z.string().optional(),
});

export type UidAttribute = z.infer<typeof uidAttribute>;

export const richTextAttribute = baseAttribute.extend({
    type: z.literal('richtext'),
});

export type RichTextAttribute = z.infer<typeof richTextAttribute>;

export const jsonAttribute = baseAttribute.extend({
    type: z.literal('json'),
});

export type JsonAttribute = z.infer<typeof jsonAttribute>;

export const passwordAttribute = baseAttribute.extend({
    type: z.literal('password'),
});

export type PasswordAttribute = z.infer<typeof passwordAttribute>;

export const integerAttribute = baseAttribute.extend({
    type: z.literal('integer'),
});

export const floatAttribute = baseAttribute.extend({
    type: z.literal('float'),
});

export const bigIntAttribute = baseAttribute.extend({
    type: z.literal('biginteger'),
});

export const decimalAttribute = baseAttribute.extend({
    type: z.literal('decimal'),
});

export const numberAttribute = z.union([
    integerAttribute,
    floatAttribute,
    bigIntAttribute,
    decimalAttribute,
]);

export type NumberAttribute = z.infer<typeof numberAttribute>;

export const enumAttribute = baseAttribute.extend({
    type: z.literal('enumeration'),
    enum: z.array(z.string()),
});

export type EnumAttribute = z.infer<typeof enumAttribute>;

export const dateOnlyAttribute = baseAttribute.extend({
    type: z.literal('date'),
});

export const dateTimeAttribute = baseAttribute.extend({
    type: z.literal('datetime'),
});

export const timeAttribute = baseAttribute.extend({
    type: z.literal('time'),
});

export const dateAttribute = z.union([
    dateOnlyAttribute,
    dateTimeAttribute,
    timeAttribute,
]);

export type DateAttribute = z.infer<typeof dateAttribute>;

export const mediaAttribute = baseAttribute.extend({
    type: z.literal('media'),
    multiple: z.boolean().optional(),
    allowedTypes: z
        .array(z.enum(['images', 'videos', 'audios', 'files']))
        .optional()
        .default(['images', 'videos', 'audios', 'files']),
});

export type MediaAttribute = z.infer<typeof mediaAttribute>;

export const booleanAttribute = baseAttribute.extend({
    type: z.literal('boolean'),
});

export type BooleanAttribute = z.infer<typeof booleanAttribute>;

export const baseRelationAttribute = baseAttribute.extend({
    type: z.literal('relation'),
    target: z.string(),
});

export const hasOneAttribute = baseRelationAttribute.extend({
    relation: z.literal('oneToOne'),
});

export const oneToOneAttribute = baseRelationAttribute.extend({
    relation: z.literal('oneToOne'),
    inversedBy: z.string(),
});

export const belongsToManyAttribute = baseRelationAttribute.extend({
    mappedBy: z.string(),
    relation: z.literal('oneToMany'),
});

export const manyToOneAttribute = baseRelationAttribute.extend({
    relation: z.literal('manyToOne'),
    inversedBy: z.string(),
});

export const manyToManyAttribute = baseRelationAttribute.extend({
    relation: z.literal('manyToMany'),
    inversedBy: z.string().optional(),
    mappedBy: z.string().optional(),
});

export const hasManyAttribute = baseRelationAttribute.extend({
    relation: z.literal('oneToMany'),
});

export const morphToManyAttribute = z.object({
    type: z.literal('relation'),
    relation: z.literal('morphToMany'),
});

export const relationAttribute = z.union([
    hasOneAttribute,
    oneToOneAttribute,
    belongsToManyAttribute,
    manyToOneAttribute,
    manyToManyAttribute,
    hasManyAttribute,
    morphToManyAttribute,
]);

export type RelationAttribute = z.infer<typeof relationAttribute>;

export const componentAttribute = baseAttribute.extend({
    type: z.literal('component'),
    repeatable: z.boolean().optional(),
    component: z.string(),
});

export type ComponentAttribute = z.infer<typeof componentAttribute>;

export const dynamiczoneAttribute = baseAttribute.extend({
    type: z.literal('dynamiczone'),
    components: z.array(z.string()),
});

export type DynamiczoneAttribute = z.infer<typeof dynamiczoneAttribute>;

export const attribute = z.union([
    textAttribute,
    emailAttribute,
    uidAttribute,
    richTextAttribute,
    jsonAttribute,
    passwordAttribute,
    numberAttribute,
    enumAttribute,
    dateAttribute,
    mediaAttribute,
    booleanAttribute,
    relationAttribute,
    componentAttribute,
]);

export type Attribute = z.infer<typeof attribute>;

export const contentTypeAttribute = z.union([
    attribute,
    dynamiczoneAttribute,
]);

export type ContentTypeAttribute = z.infer<typeof contentTypeAttribute>;
