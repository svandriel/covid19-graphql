import { IResolvers, makeExecutableSchema } from 'apollo-server-express';
import { mergeDeepLeft } from 'ramda';

import { ApiResolvers } from '../generated/graphql-backend';
import { typeDefs } from './common.graphql';
import { resolvers as commonResolvers } from './common.resolvers';
import { typeDefs as Country } from './country/country.graphql';
import { resolvers as countryResolvers } from './country/country.resolvers';
import { typeDefs as Region } from './region/region.graphql';
import { resolvers as regionResolvers } from './region/region.resolvers';
import { typeDefs as SubRegion } from './subregion/subregion.graphql';
import { resolvers as subRegionResolvers } from './subregion/subregion.resolvers';

const resolvers = [commonResolvers, countryResolvers, regionResolvers, subRegionResolvers].reduce(
    (acc, item) => mergeDeepLeft(acc, item) as ApiResolvers,
);

export const schema = makeExecutableSchema({
    typeDefs: [typeDefs, Country, Region, SubRegion],
    resolvers: resolvers as IResolvers,
});
