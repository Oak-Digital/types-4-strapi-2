import { ExtraType } from './ExtraType';

/* const requiredByString = `type RequiredBy<T, K extends string> = Required<Pick<T, K>> & Omit<T, K>;`; */
const requiredByString = `type RequiredBy<T, K extends string> = Required<Pick<T, Extract<K, keyof T>>> & Omit<T, Extract<K, keyof T>>;`;
const extractNestedString =
    'type ExtractNested<T, K extends string> = T extends `${K}.${infer U}` ? U : never;';
const extractFlatString =
    'type ExtractFlat<T extends string> = T extends `${infer U}.${string}` ? U : T;';

const extraTypeData = {
    RequiredBy: requiredByString,
    ExtractNested: extractNestedString,
    ExtractFlat: extractFlatString,
};

export const createExtraTypes = () => {
    return Object.entries(extraTypeData).map(([name, typeString]) => {
        const extraType = new ExtraType(typeString, name, 'builtins');
        return extraType;
    });
};
