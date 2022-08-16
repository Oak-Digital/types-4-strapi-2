import { program } from 'commander';
import InterfaceManager from './interface/InterfaceManager';

program
    .name('t4s');

program
    .option('-i, --in <dir>', 'The src directory for strapi', './src')
    .option('-o, --out <dir>', 'The output directory to output the types to', './types')
    .option('--component-prefix <prefix>', 'A prefix for components', '')
    .option('--prettier <file>', 'The prettier config file to use for formatting typescript interfaces');

program.parse();
const options = program.opts();
const {
    in: input,
    out,
    componentPrefix,
    prettier: prettierFile,
} = options;

const manager = new InterfaceManager(out, input, {
    componentPrefix,
    prettierFile,
});
manager.run().catch((err) => {
    console.error(err);
});
