import { Moment } from 'moment';
import { allPass, isNil } from 'ramda';

import { Country, getCountryLookup } from '../country-lookup';
import {
    ApiCountry,
    ApiCountryFilter,
    ApiPagedCountries,
    ApiRegion,
    ApiResolvers,
    ApiSubRegion,
    ApiTimelineItem,
} from '../generated/graphql-backend';
import { paginate, PaginatedList } from '../util/paginate';
import { Context } from './context';
import { LocalDate } from './custom-scalars/local-date';

export const resolvers: ApiResolvers = {
    Query: {
        globalTimeline: async (_query, { from, to }, context) => {
            const stats = await context.dataSource.getGlobalTimeSeriesFromCsv();
            return applyTimeSeriesRange({ from, to } || {}, stats);
        },
        country: async (_query, { code }) => {
            const lookup = await getCountryLookup();
            const upperCode = code.toUpperCase();
            return createApiCountry(lookup.lookupByCode[upperCode]);
        },
        countries: async (_query, args, context) => {
            const lookup = await getCountryLookup();
            return await applyCountryFilter(args, context, (lookup.list as any[]) as ApiCountry[]);
        },
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

    Country: {
        region: async country => {
            const lookup = await getCountryLookup();
            const regionName = lookup.lookupByCode[country.code].region;
            return createApiRegion(regionName);
        },
        subRegion: async country => {
            const lookup = await getCountryLookup();
            const subRegionName = lookup.lookupByCode[country.code].subRegion;
            return createApiSubRegion(subRegionName);
        },
        timeline: async (country, { from, to }, context) => {
            const stats = await context.dataSource.getTimelineForCountryFromCsv(country.code);
            return applyTimeSeriesRange({ from, to }, stats);
        },
        latest: async (country, _args, context) => {
            return context.dataSource.getCurrentForCountry(country.code) as Promise<ApiTimelineItem>;
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

    LocalDate,
};

interface CountryOptions {
    offset: number;
    count: number;
    filter?: ApiCountryFilter;
}

async function applyCountryFilter(
    args: CountryOptions,
    context: Context,
    input: ApiCountry[],
): Promise<PaginatedList<ApiCountry>> {
    const { offset, count, filter } = args;
    const { search, exclude, hasCases } = filter || {};
    const filters: Array<(item: ApiCountry) => boolean> = [];
    if (search) {
        const upperSearch = search.toUpperCase();
        filters.push((item: ApiCountry) => {
            return item.name.toUpperCase().indexOf(upperSearch) !== -1 || item.code.indexOf(upperSearch) !== -1;
        });
    }
    if (exclude) {
        filters.push(country => !exclude.includes(country.code));
    }
    if (!isNil(hasCases)) {
        const countriesWithCases = await context.dataSource.getCountryCodesWithCases();
        filters.push(country => countriesWithCases.includes(country.code) === hasCases);
    }
    const countries = (input as any[]) as ApiCountry[];
    const filteredCountries = countries.filter(allPass(filters));
    return paginate({ offset, count }, filteredCountries);
}

function createApiCountry(country: Country | undefined): ApiCountry {
    return country
        ? {
              code: country.code,
              name: country.name,
              region: (undefined as any) as ApiRegion,
              subRegion: (undefined as any) as ApiSubRegion,
              timeline: [],
              latest: (undefined as any) as ApiTimelineItem,
          }
        : ((undefined as any) as ApiCountry);
}

function createApiRegion(name: string): ApiRegion {
    return {
        name,
        countries: (undefined as any) as ApiPagedCountries,
        subRegions: [],
        timeline: [],
    };
}

function createApiSubRegion(name: string): ApiSubRegion {
    return {
        name,
        countries: (undefined as any) as ApiPagedCountries,
        region: (undefined as any) as ApiRegion,
        timeline: [],
    };
}

function applyTimeSeriesRange(
    { from, to }: { from?: Moment | null; to?: Moment | null },
    stats: readonly ApiTimelineItem[],
): readonly ApiTimelineItem[] {
    if (isNil(from) && isNil(to)) {
        return stats;
    }
    let fromIndex: number = 0;
    let toIndex: number = stats.length;
    if (from) {
        fromIndex = stats.findIndex(i => i.date >= from);
        if (fromIndex === -1) {
            fromIndex = 0;
        }
    }
    if (to) {
        toIndex = stats.findIndex(i => i.date >= to);
        if (toIndex === -1) {
            toIndex = stats.length;
        }
    }
    return stats.slice(fromIndex, toIndex);
}
