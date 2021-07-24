import path from 'path';
import glob from 'glob';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { IExecutableSchemaDefinition, makeExecutableSchema } from '@graphql-tools/schema';
import { loadFiles } from '@graphql-tools/load-files';

import { Context } from '.';
import { getResolvers } from '../schema';

async function getSchemaExtensions(): Promise<IExecutableSchemaDefinition<Context>> {
    glob.sync(path.join(__dirname, "..", '**', "*.{js,ts}"), {
        ignore: [
            path.join(__dirname, "..", "**", "__tests__", "*.{js,ts}"),
            path.join(__dirname, "..", "**", "*.{spec,test}.{js,ts}"),
        ]
    })
        .forEach(file => require("./" + path.relative(__dirname, file)));

    const typesArray = await loadFiles(path.join(__dirname, '..', '**', '*.graphql'));

    const typeDefs = mergeTypeDefs(typesArray);

    return {
        typeDefs,
        logger: {
            log: console.error
        },
        allowUndefinedInResolve: true,
        resolvers: mergeResolvers(getResolvers()),
    }
}

export async function makeSchema() {
    return makeExecutableSchema(await getSchemaExtensions())
}
