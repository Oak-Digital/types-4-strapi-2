import { readdir } from 'fs/promises';

export async function readDirFiltered(dir: string) {
    const folders = await readdir(dir);
    return folders.filter((folder: string) => !folder.startsWith('.'));
}

export function prefixDotSlash(path) {
    return (/^\.?\.\//).test(path) ? path : './' + path;
}
