import { allPass, isNil } from 'ramda';

import { Country, getCountryLookup } from '../../country-lookup';
import {
    ApiCountry,
    ApiCountryFilter,
    ApiRegion,
    ApiResolvers,
    ApiSubRegion,
    ApiTimelineItem,
} from '../../generated/graphql-backend';
import { makeStringLookup } from '../../util/make-lookup';
import { paginate, PaginatedList } from '../../util/paginate';
import { Context } from '../context';
import { createApiRegion } from '../region/region.resolvers';
import { applyTimeSeriesRange } from '../resolvers';
import { createApiSubRegion } from '../subregion/subregion.resolvers';

export const resolvers: ApiResolvers = {
    Query: {
        country: async (_query, { code }) => {
            const lookup = await getCountryLookup();
            const upperCode = code.toUpperCase();
            return createApiCountry(lookup.lookupByCode[upperCode]);
        },
        countries: async (_query, args, context) => {
            const lookup = await getCountryLookup();
            return await applyCountryFilter(args, context, (lookup.list as any[]) as ApiCountry[]);
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
};

export interface CountryOptions {
    offset: number;
    count: number;
    filter?: ApiCountryFilter;
}

export async function applyCountryFilter(
    args: CountryOptions,
    context: Context,
    input: ApiCountry[],
): Promise<PaginatedList<ApiCountry>> {
    const { offset, count, filter } = args;
    const { search, include, exclude, hasCases } = filter || {};
    const filters: Array<(item: ApiCountry) => boolean> = [];
    if (search) {
        const upperSearch = search.toUpperCase();
        filters.push((item: ApiCountry) => {
            return item.name.toUpperCase().indexOf(upperSearch) !== -1 || item.code.indexOf(upperSearch) !== -1;
        });
    }
    if (include) {
        const includeLookup = makeStringLookup(include);
        filters.push(country => !!includeLookup[country.code]);
    }
    if (exclude) {
        const excludeLookup = makeStringLookup(exclude);
        filters.push(country => !excludeLookup[country.code]);
    }
    if (!isNil(hasCases)) {
        const countriesWithCases = await context.dataSource.getCountryCodesWithCases();
        filters.push(country => countriesWithCases.includes(country.code) === hasCases);
    }
    const countries = (input as any[]) as ApiCountry[];
    const filteredCountries = countries.filter(allPass(filters));
    return paginate({ offset, count }, filteredCountries);
}

export function createApiCountry(country: Country | undefined): ApiCountry {
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
