import { program } from 'commander';
import InterfaceManager from './program/InterfaceManager';
import { ByFileContentTypeReader } from './readers/by-file';
import { BasicWriter } from './writers/basic-writer';
import prettier from 'prettier';
import { LoadStrapiReader } from './readers/load-strapi';
import { ContentTypeReader } from './readers/types/content-type-reader';

program.name('t4s');

program
    .option('-i, --in <dir>', 'The root directory for strapi', './')
    .option(
        '-o, --out <dir>',
        'The output directory to output the types to',
        './types'
    )
    .option('-r, --reader <reader>', 'The reader to use (possible: by-file, load-strapi. See docs for more info)', 'by-file')
    .option('--prefix <prefix>', 'A prefix for all generated interfaces', 'I')
    .option('--component-prefix <prefix>', 'A prefix for components', '')
    .option(
        '-D, --delete-old',
        'CAUTION: This option is equivalent to running rm -rf on the output directory first'
    )
    .option(
        '--file-case <case>',
        'Which case to use for generated files',
        'pascal'
    )
    .option(
        '--folder-case <case>',
        'Which case to use for generated folders',
        'kebab'
    )
    .option(
        '--plugins <plugins...>',
        'A list of enabled plugins in the target strapi project that modify content-types'
    )
    .option(
        '--prettier <file>',
        'The prettier config file to use for formatting typescript interfaces'
    );

program.parse();
const options = program.opts();
const {
    in: input,
    out,
    componentPrefix,
    prefix,
    prettier: prettierFile,
    deleteOld,
    fileCase: fileCaseType,
    folderCase: folderCaseType,
    plugins,
    reader: readerName,
} = options;

(async () => {
    const defaultPrettierOptions = {
        parser: 'typescript',
    };
    let prettierOptions: prettier.Options = defaultPrettierOptions;
    if (prettierFile) {
        const resolved = await prettier.resolveConfig(prettierFile, {
            editorconfig: true,
        });
        prettierOptions = {
            ...defaultPrettierOptions,
            ...resolved,
        };
    }

    let reader: ContentTypeReader;
    switch (readerName) {
        case 'by-file':
            reader = new ByFileContentTypeReader(input);
            break;
        case 'load-strapi':
            reader = new LoadStrapiReader(input);
            break;
        default:
            throw new Error(`Unknown reader: ${readerName}`);
    }
    const writer = new BasicWriter(out, {
        deleteOld,
        prettierOptions,
    });

    const manager = new InterfaceManager(reader, writer, {
        componentPrefix,
        prefix,
        fileCaseType,
        folderCaseType,
        enabledPlugins: plugins,
    });
    manager.run().catch((err) => {
        console.error(err);
    });
})();
