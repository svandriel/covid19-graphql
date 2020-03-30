import { getCountryLookup } from '../../country-lookup';
import { ApiPagedCountries, ApiRegion, ApiResolvers, ApiSubRegion } from '../../generated/graphql-backend';
import { applyTimeSeriesRange } from '../common.resolvers';
import { createSubRegionFilter } from '../filters';

export const resolvers: ApiResolvers = {
    Query: {
        subRegion: async (_query, { name }) => {
            const lookup = await getCountryLookup();
            if (!lookup.subRegionNames.includes(name)) {
                return (undefined as any) as ApiSubRegion;
            } else {
                return createApiSubRegion(name);
            }
        },
        subRegions: async () => {
            const lookup = await getCountryLookup();
            return lookup.subRegionNames.map(createApiSubRegion);
        },
    },

    SubRegion: {
        timeline: async (subRegion, { from, to }, context) => {
            const lookup = await getCountryLookup();
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(
                createSubRegionFilter(lookup, [subRegion.name]),
            );
            return applyTimeSeriesRange({ from, to }, stats);
        },
    },

    Region: {
        subRegions: async region => {
            const lookup = await getCountryLookup();
            return lookup.subRegionsByRegionName[region.name].map(createApiSubRegion);
        },
    },

    Country: {
        subRegion: async country => {
            const lookup = await getCountryLookup();
            const subRegionName = lookup.lookupByCode[country.code].subRegion;
            return createApiSubRegion(subRegionName);
        },
    },
};

function createApiSubRegion(name: string): ApiSubRegion {
    return {
        name,
        countries: (undefined as any) as ApiPagedCountries,
        region: (undefined as any) as ApiRegion,
        timeline: [],
    };
}
