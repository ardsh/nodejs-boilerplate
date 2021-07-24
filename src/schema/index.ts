import { ResolversDefinition } from '@graphql-tools/merge';
import { Context } from '../utils';

const resolvers = [] as ResolversDefinition<Context>[];
export function registerResolver(resolver: ResolversDefinition<Context>) {
    resolvers.push(resolver);
}

export function getResolvers(): any[] {
    return resolvers;
}
