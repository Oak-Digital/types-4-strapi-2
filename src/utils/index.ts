import { readdir } from 'fs/promises';

export function pascalCase(name: string) {
    const words = name.match(/[a-z]+/gi);
    const pascalName = words.map((word: string) => {
        return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    }).join('');
    // console.log(pascalName)
    return pascalName;
}

export async function readDirFiltered(dir: string) {
    const folders = await readdir(dir);
    return folders.filter((folder: string) => !folder.startsWith('.'));
}

export function prefixDotSlash(path) {
    return (/^\.?\.\//).test(path) ? path : './' + path;
}
