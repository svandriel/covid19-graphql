import { getCountryLookup } from '../../country-lookup';
import { ApiPagedCountries, ApiRegion, ApiResolvers, ApiSubRegion } from '../../generated/graphql-backend';
import { applyCountryFilter, createApiCountry } from '../country/country.resolvers';
import { createApiRegion } from '../region/region.resolvers';
import { applyTimeSeriesRange } from '../resolvers';

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
        countries: async (subRegion, args, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerSubRegion[subRegion.name].map(createApiCountry);
            return await applyCountryFilter(args, context, countries);
        },
        region: async subRegion => {
            const lookup = await getCountryLookup();
            const regionName = lookup.regionPerSubRegion[subRegion.name];
            return createApiRegion(regionName);
        },
        timeline: async (subRegion, { from, to }, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerSubRegion[subRegion.name].reduce((acc, item) => {
                acc[item.code] = true;
                return acc;
            }, {} as Record<string, boolean>);
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(item => countries[item.countryCode]);
            return applyTimeSeriesRange({ from, to }, stats);
        },
    },
};

export function createApiSubRegion(name: string): ApiSubRegion {
    return {
        name,
        countries: (undefined as any) as ApiPagedCountries,
        region: (undefined as any) as ApiRegion,
        timeline: [],
    };
}
