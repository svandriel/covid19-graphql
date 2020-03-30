import { IResolvers, makeExecutableSchema } from 'apollo-server-express';
import { mergeDeepLeft } from 'ramda';

import { typeDefs } from './common.graphql';
import { resolvers as commonResolvers } from './common.resolvers';
import { typeDefs as Country } from './country/country.graphql';
import { resolvers as countryResolvers } from './country/country.resolvers';
import { resolvers as regionResolvers } from './region.resolvers';
import { typeDefs as Region } from './region/region.graphql';
import { typeDefs as SubRegion } from './subregion/subregion.graphql';
import { resolvers as subRegionResolvers } from './subregion/subregion.resolvers';

const resolvers = [commonResolvers, countryResolvers, regionResolvers, subRegionResolvers].reduce(mergeDeepLeft);

export const schema = makeExecutableSchema({
    typeDefs: [typeDefs, Country, Region, SubRegion],
    resolvers: resolvers as IResolvers,
});
