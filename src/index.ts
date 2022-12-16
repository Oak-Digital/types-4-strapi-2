import { program } from 'commander';
import InterfaceManager from './program/InterfaceManager';

program
    .name('t4s');

program
    .option('-i, --in <dir>', 'The src directory for strapi', './src')
    .option('-o, --out <dir>', 'The output directory to output the types to', './types')
    .option('--prefix <prefix>', 'A prefix for all generated interfaces', 'I')
    .option('--component-prefix <prefix>', 'A prefix for components', '')
    .option('-D, --delete-old', 'CAUTION: This option is equivalent to running rm -rf on the output directory first')
    .option('--file-case <case>', 'Which case to use for generated files', 'pascal')
    .option('--folder-case <case>', 'Which case to use for generated folders', 'kebab')
    .option('--plugins <plugins...>', 'A list of enabled plugins in the target strapi project that modify content-types')
    .option('--prettier <file>', 'The prettier config file to use for formatting typescript interfaces');

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

const manager = new InterfaceManager(out, input, {
    componentPrefix,
    prefix,
    prettierFile,
    deleteOld,
    fileCaseType,
    folderCaseType,
    enabledPlugins: plugins,
});
manager.run().catch((err) => {
    console.error(err);
});
