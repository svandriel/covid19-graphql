import { IResolvers, makeExecutableSchema } from 'apollo-server-express';

import { resolvers } from './resolvers';
import { typeDefs } from './schema.graphql';

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as IResolvers,
});
