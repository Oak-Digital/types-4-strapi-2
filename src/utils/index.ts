import { readdir } from "fs/promises";

export function strapiToPascalCase(strapiName: string) {

}

export async function readDirFiltered(dir: string) {
    const folders = await readdir(dir);
    return folders.filter((folder: string) => !folder.startsWith("."));
}
