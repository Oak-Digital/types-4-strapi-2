import { program } from 'commander';
import InterfaceManager from './interface/InterfaceManager';

program
    .name('t4s');

program
    .option('-i, --in <dir>', 'The src directory for strapi', './src')
    .option('-o, --out <dir>', 'The output directory to output the types to', './types')
    .option('--component-prefix <prefix>', 'A prefix for components', '');

program.parse();
const options = program.opts();
const {
    in: input,
    out,
    componentPrefix,
} = options;

const manager = new InterfaceManager(out, input, {
    componentPrefix,
});
manager.run().catch((err) => {
    console.error(err);
});
