import { getCountryLookup } from '../../country-lookup';
import {
    ApiPagedCountries,
    ApiRegion,
    ApiResolvers,
    ApiSubRegion,
    ApiTimelineItem,
} from '../../generated/graphql-backend';
import { applyTimelineRange } from '../common.resolvers';
import { countryPredicate } from '../country-predicate';
import { mergeCountryStats } from '../../merging/merge-country-stats';
import { today } from '../../util/timeline-item-utils';

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
            const predicate = countryPredicate(lookup, {
                subRegions: [subRegion.name],
            });
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(predicate);
            return applyTimelineRange({ from, to }, stats);
        },
        latest: async (subRegion, _args, context) => {
            const lookupPromise = getCountryLookup();
            const current = await context.dataSource.getCurrent();
            const predicate = countryPredicate(await lookupPromise, {
                subRegions: [subRegion.name],
            });
            const filtered = current.filter(stat => predicate(stat.countryCode));
            return filtered.reduce(mergeCountryStats, today());
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
        latest: (undefined as any) as ApiTimelineItem,
    };
}
