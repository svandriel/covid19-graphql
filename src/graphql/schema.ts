import { IResolvers, makeExecutableSchema } from 'apollo-server-express';

import { Resolvers } from '../generated/graphql-backend';
import { typeDefs } from './schema.graphql';
import { mergeStats } from '../merge-stats';

const resolvers: Resolvers = {
    Query: {
        ping: () => 'pong',
        get: async (query, args, context) => {
            // context
            const all = await context.dataSource.fetchMerged();
            return all;
        }
    }
};

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as IResolvers
});
