import { pluck } from 'ramda';

import { getCountryLookup } from '../../country-lookup';
import { ApiPagedCountries, ApiRegion, ApiResolvers } from '../../generated/graphql-backend';
import { makeStringLookup } from '../../util/make-lookup';
import { applyTimeSeriesRange } from '../common';

export const resolvers: ApiResolvers = {
    Query: {
        region: async (_query, { name }) => {
            const lookup = await getCountryLookup();
            if (!lookup.regionNames.includes(name)) {
                return (undefined as any) as ApiRegion;
            } else {
                return createApiRegion(name);
            }
        },
        regions: async () => {
            const lookup = await getCountryLookup();
            return lookup.regionNames.map(createApiRegion);
        },
    },

    Country: {
        region: async country => {
            const lookup = await getCountryLookup();
            const regionName = lookup.lookupByCode[country.code].region;
            return createApiRegion(regionName);
        },
    },

    Region: {
        timeline: async (region, { from, to }, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerRegion[region.name];
            const countryCodeLookup = makeStringLookup(pluck('code', countries));
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(
                item => !!countryCodeLookup[item.countryCode],
            );
            return applyTimeSeriesRange({ from, to }, stats);
        },
    },

    SubRegion: {
        region: async subRegion => {
            const lookup = await getCountryLookup();
            const regionName = lookup.regionPerSubRegion[subRegion.name];
            return createApiRegion(regionName);
        },
    },
};

function createApiRegion(name: string): ApiRegion {
    return {
        name,
        countries: (undefined as any) as ApiPagedCountries,
        subRegions: [],
        timeline: [],
    };
}
