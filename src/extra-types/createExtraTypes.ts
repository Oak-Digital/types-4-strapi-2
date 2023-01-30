import { ExtraType } from "./ExtraType";

const requiredByString = `type RequiredBy<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;`;
const extractNestedString =
    'type ExtractNested<T, K extends string> = T extends `${K}.${infer U}` ? U : never;';
const extractFlatString =
    'type ExtractFlat<T, K extends string> = T extends string ? Extract<T, K> : T extends object ? { [P in keyof T]-?: ExtractFlat<T[P], K> } : never;';

const extraTypeData = {
    'RequiredBy': requiredByString,
    'ExtractNested': extractNestedString,
    'ExtractFlat': extractFlatString,
};

export const createExtraTypes = () => {
    return Object.entries(extraTypeData).map(([name, typeString]) => {
        const extraType = new ExtraType(typeString, name, 'builtins');
        return extraType;
    });
}
