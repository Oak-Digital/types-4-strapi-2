import { z } from 'zod';
import { attribute } from './attributes';

export const strapiComponent = z.object({
    collectionName: z.string(),
    attributes: z.record(attribute),
    options: z.object({}),
    uid: z.string().optional(),
});

export type StrapiComponent = z.infer<typeof strapiComponent>;
