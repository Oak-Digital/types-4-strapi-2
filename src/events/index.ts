export enum Events {
    BeforeReadSchema = 'BeforeReadSchema',
    AfterReadSchema = 'AfterReadSchema',
}

export type SchemasType = {
    apiSchemas: Record<string, any>[];
    componentSchemas: Record<string, any>[];
}

export type EventTypes = {
    BeforeReadSchema: SchemasType,
    AfterReadSchema: SchemasType,
}
