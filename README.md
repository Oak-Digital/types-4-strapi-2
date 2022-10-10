# types-4-strapi-2

types-4-strapi-2 is a TypeScript program that will generate TypeScript types for your strapi projects.
This can be useful if you have a frontend written with TypeScript to make sure you are using the correct types and can help report errors at compile time.

types-4-strapi-2 is a rewrite of [francescolorenzetti/types-4-strapi](https://github.com/francescolorenzetti/types-4-strapi) written in TypeScript, with the goal of being much easier to extend and maintain.

## Requirements

* Node `>=v16`

## Getting started

Install the script for your project:

```bash
# NPM
npm install --save-dev @oak-digital/types-4-strapi-2
# YARN
yarn add -D @oak-digital/types-4-strapi-2
```

Then set up a script in your `package.json`

```jsonc
// package.json
{
    "scripts": {
        "types": "t4s"
    }
}
```

In some cases it is desirable to change the output directory which is `./types` by default.
This can be done with the `--out` flag like in the following example.

```jsonc
// package.json
{
    "scripts": {
        "types": "t4s --out ../frontend/src/lib/types"
    }
}
```

## Features

* Generate TypeScript interfaces for all your api content-types and components
* Generate TypeScript interfaces for builtin types such as `Media` and `MediaFormat`
* Select input and output directory
* Prettier formatting and ability to use your own `.prettierrc`.

### Planned features

* Support for localization
* Support if you are using other plugins, such as `url-alias`, which should add extra fields for some interfaces.

## Flags

| **Flag**                    | **Description**                                                                      | **Default** |
|-----------------------------|--------------------------------------------------------------------------------------|-------------|
| -i, --in <dir>              | The src directory for strapi                                                         | `./src`     |
| -o, --out <dir>             | The output directory to output the types to                                          | `./types`   |
| --prefix <prefix>           | A prefix for all generated interfaces                                                | `I`         |
| --component-prefix <prefix> | A prefix for components                                                              | none        |
| -D, --delete-old            | CAUTION: This option is equivalent to running `rm -rf` on the output directory first | `false`     |
| --prettier <file>           | The prettier config file to use for formatting TypeScript interfaces                 | none        |

## Tips and tricks

### Generate interfaces as soon as you create/modify/delete new components or content types

You can make an extension for your strapi project to generate the new typescript interfaces as soon as they are created with strapi.
If you followed the step of adding a script to your `package.json`, you can easily make an extension that just calls `npm run types`.
An example of how this can be done is shown in the following snippet.

```typescript
// src/extensions/content-type-builder/strapi-server.ts
import { exec } from "child_process";

export default (plugin: any) => {
  const componentRunAfter = [
    "createComponent",
    "deleteComponent",
    "updateComponent",
  ];
  const contentTypesRunAfter = [
    "createContentType",
    "updateContentType",
    "deleteContentType",
  ];
  componentRunAfter.forEach((name) => {
    const oldFunc = plugin.controllers.components[name];
    plugin.controllers.components[name] = async (ctx: any) => {
      await oldFunc(ctx);
      exec("npm run types");
      return ctx
    }
  })
  contentTypesRunAfter.forEach((name) => {
    const oldFunc = plugin.controllers['content-types'][name];
    plugin.controllers["content-types"][name] = async (ctx: any) => {
      await oldFunc(ctx);
      exec("npm run types");
      return ctx
    }
  })
  return plugin;
}
```

## Building

To build this project, use the following command

```bash
npm run build
```

## Publishing

```bash
npm run build
npm publish
```
