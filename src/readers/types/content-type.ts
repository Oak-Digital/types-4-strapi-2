import { z } from 'zod';
import { contentTypeAttribute } from './attributes';

export const strapiContentType = z.object({
    attributes: z.record(contentTypeAttribute),
    collectionName: z.string(),
    options: z.object({
        draftAndPublish: z.boolean().optional().default(false),
    }),
    uid: z.string().optional(),
});

export type StrapiContentType = z.infer<typeof strapiContentType>;
