import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import InterfaceManager from '../src/program/InterfaceManager';
import { ByFileContentTypeReader } from '../src/readers/by-file';
import { contentTypeAttribute } from '../src/readers/types/attributes';
import { BasicWriter } from '../src/writers/basic-writer';

async function run() {
    const parsedDynamiczone = contentTypeAttribute.parse({
        type: 'dynamiczone',
        components: ['blocks.paragraph', 'blocks.image'],
    });

    assert.equal(parsedDynamiczone.type, 'dynamiczone');
    assert.deepEqual(parsedDynamiczone.components, [
        'blocks.paragraph',
        'blocks.image',
    ]);

    const parsedUnknown = contentTypeAttribute.parse({
        type: 'some-unknown-type',
    });

    assert.equal(parsedUnknown.type, 'any');

    const outputDirectory = await mkdtemp(
        join(tmpdir(), 'types-4-strapi-2-dynamiczone-')
    );
    const reader = new ByFileContentTypeReader(
        join(process.cwd(), 'tests/strapi-project')
    );
    const writer = new BasicWriter(outputDirectory, {
        deleteOld: true,
        indexFile: false,
    });
    const manager = new InterfaceManager(reader, writer);

    await manager.run();

    const generatedContentType = await readFile(
        join(outputDirectory, 'api', 'DynamicZoneTest.ts'),
        'utf8'
    );

    assert.match(
        generatedContentType,
        /content\?: Array<[\s\S]*IBlocksAccordion<ExtractNested<Populate, "content">>[\s\S]*IBlocksParagraph<ExtractNested<Populate, "content">>[\s\S]*IBlocksImage<ExtractNested<Populate, "content">>[\s\S]*>;/,
    );
    assert.doesNotMatch(generatedContentType, /content\??:\s*any/);
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
