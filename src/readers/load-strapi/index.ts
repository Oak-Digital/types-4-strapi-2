// This reader works by loading Strapi and accessing the content types directly on the instance

import { spawn, spawnSync } from 'child_process';
import { cp, rm } from 'fs/promises';
import { join } from 'path/posix';
import { z } from 'zod';
import { strapiComponent } from '../types/component';
import { StrapiContentType, strapiContentType } from '../types/content-type';
import { ContentTypeReader } from '../types/content-type-reader';

const schema = z.tuple([
    z.record(strapiContentType),
    z.record(strapiComponent),
]);

export class LoadStrapiReader implements ContentTypeReader {
    private strapiRoot: string;
    private loadStrapiPromise: Promise<z.infer<typeof schema>>;

    constructor(strapiRoot: string) {
        this.strapiRoot = strapiRoot;

        this.loadStrapiPromise = this.loadStrapi();
    }

    async readContentTypes() {
        const data = (await this.loadStrapiPromise)[0];

        const newData: Awaited<
            ReturnType<ContentTypeReader['readContentTypes']>
        > = {};
        Object.entries(data).forEach(([strapiName, schema]) => {
            const [namespace, collectionAndBase] = strapiName.split('::');

            if (namespace === 'admin') {
                newData[strapiName] = {
                    namespace: namespace,
                    name: collectionAndBase,
                    contentType: schema,
                };
                return;
            }

            const [collection, base] = collectionAndBase.split('.');

            newData[strapiName] = {
                namespace: namespace,
                collection,
                name: base,
                contentType: schema,
            };
        });

        return newData;
    }

    async readComponents() {
        const data = (await this.loadStrapiPromise)[1];
        return data;
    }

    private async loadStrapi() {
        const localRemoteFile = join(__dirname, 'remote.js');
        const remoteRemoteFile = join(
            process.cwd(),
            this.strapiRoot,
            '.t4s.remote.js'
        );

        // Plant the remote execution file in the strapi project
        await cp(localRemoteFile, remoteRemoteFile);
        const output = await new Promise<string>((resolve, reject) => {
            const remote = spawn('node', [remoteRemoteFile], {
                cwd: this.strapiRoot,
            });
            const data = [];
            remote.stdout.on('data', (chunk) => {
                data.push(chunk);
            });

            remote.stderr.on('data', (chunk) => {
                console.error(chunk.toString());
            });

            remote.on('close', () => {
                resolve(data.map((b) => b?.toString()).join(''));
            });

            remote.on('error', (err) => {
                reject(err);
            });
        });
        let jsonParsed: unknown;
        try {
            jsonParsed = JSON.parse(output);
        } catch (err) {
            console.error(err, output.slice(0, 100));
            throw new Error('Failed to parse output from remote strapi');
        }

        let parsed: z.infer<typeof schema>;
        try {
            parsed = schema.parse(jsonParsed);
        } catch (err) {
            console.error(err);
            throw new Error('Failed to parse output from remote strapi, something may be malformed');
        }

        // Remove the remote execution file after we're done
        await rm(remoteRemoteFile);

        return parsed;
    }
}
