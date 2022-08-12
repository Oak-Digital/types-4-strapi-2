import { program } from 'commander'
import * as fs from 'node:fs/promises'
import InterfaceManager from './interface/InterfaceManager'

program
    .name("t4s")

program
    .option('-i, --in <dir>', 'The src directory for strapi', './src')
    .option('-o, --out <dir>', 'The output directory to output the types to', './types')

program.parse()
const options = program.opts()
const {
    in: input,
    out,
} = options

const manager = new InterfaceManager(out, input)
manager.run().catch((err) => {
    console.error(err)
});
