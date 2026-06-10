import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function run() {
    const cacheDir = await mkdtemp(join(tmpdir(), 'types-4-strapi-2-npm-cache-'));

    try {
        const { stdout } = await execFileAsync(
            'npm',
            ['pack', '--json', '--cache', cacheDir],
            { cwd: process.cwd() }
        );

        const [{ files }] = JSON.parse(stdout) as Array<{
            files: Array<{ path: string }>;
        }>;
        const packedFiles = new Set(files.map((file) => file.path));

        assert.ok(
            packedFiles.has('lib/readers/types/attributes.js'),
            'Packed tarball is missing lib/readers/types/attributes.js'
        );
        assert.ok(
            packedFiles.has('lib/writers/types/writer.js'),
            'Packed tarball is missing lib/writers/types/writer.js'
        );
    } finally {
        await rm(cacheDir, { recursive: true, force: true });
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
