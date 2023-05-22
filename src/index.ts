import { program } from 'commander';
import InterfaceManager from './program/InterfaceManager';
import { ByFileContentTypeReader } from './readers/by-file';
import { BasicWriter } from './writers/basic-writer';
import prettier from 'prettier';
import { LoadStrapiReader } from './readers/load-strapi';

program.name('t4s');

program
    .option('-i, --in <dir>', 'The root directory for strapi', './')
    .option(
        '-o, --out <dir>',
        'The output directory to output the types to',
        './types'
    )
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

    /* const reader = new ByFileContentTypeReader(input); */
    const reader = new LoadStrapiReader(input);
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
