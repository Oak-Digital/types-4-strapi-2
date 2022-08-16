# types-4-strapi-2

types-4-strapi-2 is a typescript program that will generate typescript types for your strapi projects.
This can be useful if you have a frontend written with typescript to make sure you are using the correct types and can help report errors at compile time.

types-4-strapi-2 is a rewrite of (francescolorenzetti/types-4-strapi)[https://github.com/francescolorenzetti/types-4-strapi] written in typescript, with the goal of being much easier to extend and maintain.

## Getting started

Install the script for your project:

```bash
npm install --save-dev @oak-digital/types-4-strapi-2
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

* Generate typescript interfaces for all your api content-types and components
* Generate typescript interfaces for builtin types such as `Media` and `MediaFormat`
* Select input and output directory
* Prettier formatting and ability to use your own `.prettierrc`.

### Planned features

* Support for localization
* Support if you are using other plugins, such as `url-alias`, which should add extra fields for some interfaces.

## Flags

| **flag**                    | **Description**                                                                    |
|-----------------------------|------------------------------------------------------------------------------------|
| -i, --in <dir>              | The src directory for strapi                                                       |
| -o, --out <dir>             | The output directory to output the types to                                        |
| --component-prefix <prefix> | A prefix for components                                                            |
| -D, --delete-old            | CAUTION: This option is equivalent to running rm -rf on the output directory first |
| --prettier <file>           | The prettier config file to use for formatting typescript interfaces               |

## Building

To build this project, use the following command

```bash
npm run build
```

## Publihsing

```bash
npm run build
npm publish
```
