import {
    camelCase,
    pascalCase,
    dotCase,
    snakeCase,
    capitalCase,
    constantCase,
    paramCase,
} from 'change-case';

export const caseTypesArray = [
    'camel',
    'capital',
    'dot',
    'snake',
    'pascal',
    'constant',
    'kebab',
] as const;

export type caseType = typeof caseTypesArray[number];

export function checkCaseType(caseName: caseType): caseName is caseType {
    return caseTypesArray.includes(caseName);
}

export function changeCase(text: string, caseName: caseType): string {
    let name: string = text;
    switch (caseName) {
    case 'dot':
        name = dotCase(name);
        break;
    case 'camel':
        name = camelCase(name);
        break;
    case 'snake':
        name = snakeCase(name);
        break;
    case 'capital':
        name = capitalCase(name);
        break;
    case 'constant':
        name = constantCase(name);
        break;
    case 'kebab':
        // paramcase is the same as kebab
        name = paramCase(name);
        break;
    case 'pascal':
    default:
        name = pascalCase(name);
        break;
    }
    return name;
}
