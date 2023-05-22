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
* Generate TypeScript interfaces for plugins' content types
* Select input and output directory
* Prettier formatting and ability to use your own `.prettierrc`.
* Generate types for plugins such as [url-alias](https://github.com/strapi-community/strapi-plugin-url-alias)
* Population by generics

## Flags

| **Flag**                    | **Description**                                                                      | **Default** |
|-----------------------------|--------------------------------------------------------------------------------------|-------------|
| -i, --in <dir>              | The root directory for strapi                                                        | `./`     |
| -o, --out <dir>             | The output directory to output the types to                                          | `./types`   |
| -r, --reader <reader>       | The reader to use, see reader section                                                | `by-file`   |
| --prefix <prefix>           | A prefix for all generated interfaces                                                | `I`         |
| --component-prefix <prefix> | A prefix for components                                                              | none        |
| -D, --delete-old            | CAUTION: This option is equivalent to running `rm -rf` on the output directory first | `false`     |
| --prettier <file>           | The prettier config file to use for formatting TypeScript interfaces                 | none        |
| --plugins <plugins...>      | The plugins to use                                                                   | none        |

## Readers

To fetch the content types from strapi, we need to read it in some way.
In version 0.x.x it was done by simply reading the generated files.
In version 1.x.x the default will be to read the generated files with the `by-file` reader.

You can select which reader you want to use in the cli with the `--reader` flag.
The `by-file` reader is very fast, but it will not work in some cases and may not provide all the desired types.
The `load-strapi` reader is slow, but gets all types, it works by creating a strapi instance that would then have loaded all the content types, which can then be etracted.

## Using plugins

It is possible to generate types for plugins, for example url-alias gives a new field on your content types, so that plugin will automatically add that field to your types.
You can see a list of builtin plugins below.
Some plugins might not be fully featured.

It will be possible in the future to add your own plugins in later versions.

### List of supported plugins

* url-alias

### example of using plugins

```bash
$ t4s --plugins url-alias
```

## Population

If your content types contains relations, dynamic zones or media, the fields can be set to required in the same way as you would populate them in the strapi api.

Here is an example if you have a content type name page, with a relation to a related page that you want the title and date of.

```typescript
type PageWithRelated = Page<'related_page.title' | 'related_page.date'>
```

This will make the title and date field on the new type required, so that you do not need to make an extra if check.
NOTE: when doing this, you should also make sure that you are actually populating it the same way as in the api

Other example using an array

```typescript
const populatedFields = ['related_page.title', 'related_page.date'] as const; // as const is important
type PageWithRelated = Page<typeof populatedFields[number]>;
```

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
pnpm run build
```

## Publishing

```bash
pnpm version # major | minor | patch
pnpm run build
pnpm publish
```
