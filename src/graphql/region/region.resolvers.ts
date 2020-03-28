import { getCountryLookup } from '../../country-lookup';
import { ApiPagedCountries, ApiRegion, ApiResolvers } from '../../generated/graphql-backend';
import { applyCountryFilter, createApiCountry } from '../country/country.resolvers';
import { applyTimeSeriesRange } from '../common';
import { createApiSubRegion } from '../subregion/subregion.resolvers';

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

    Region: {
        countries: async (region, args, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerRegion[region.name].map(createApiCountry);
            return await applyCountryFilter(args, context, countries);
        },
        subRegions: async region => {
            const lookup = await getCountryLookup();
            return lookup.subRegionsByRegionName[region.name].map(createApiSubRegion);
        },
        timeline: async (region, { from, to }, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerRegion[region.name].reduce((acc, item) => {
                acc[item.code] = true;
                return acc;
            }, {} as Record<string, boolean>);
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(item => countries[item.countryCode]);
            return applyTimeSeriesRange({ from, to }, stats);
        },
    },
};

export function createApiRegion(name: string): ApiRegion {
    return {
        name,
        countries: (undefined as any) as ApiPagedCountries,
        subRegions: [],
        timeline: [],
    };
}
