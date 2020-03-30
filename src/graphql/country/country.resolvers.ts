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
import { includesString } from '../../util/includes-string';
import { paginate, PaginatedList } from '../../util/paginate';
import { applyTimelineRange } from '../common.resolvers';
import { Context } from '../context';

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
        timeline: async (country, { from, to }, context) => {
            const stats = await context.dataSource.getTimelineForCountryFromCsv(country.code);
            return applyTimelineRange({ from, to }, stats);
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
    },

    SubRegion: {
        countries: async (subRegion, args, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerSubRegion[subRegion.name].map(createApiCountry);
            return await applyCountryFilter(args, context, countries);
        },
    },
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
    const { search, include, exclude, hasCases } = filter || {};
    const filters: Array<(item: ApiCountry) => boolean> = [];
    if (search) {
        const upperSearch = search.toUpperCase();
        filters.push((item: ApiCountry) => {
            return item.name.toUpperCase().indexOf(upperSearch) !== -1 || item.code.indexOf(upperSearch) !== -1;
        });
    }
    if (include) {
        const isIncludedCountry = includesString(include);
        filters.push(country => isIncludedCountry(country.code));
    }
    if (exclude) {
        const isExcludedCountry = includesString(exclude);
        filters.push(country => !isExcludedCountry(country.code));
    }
    if (!isNil(hasCases)) {
        const countriesWithCases = await context.dataSource.getCountryCodesWithCases();
        const isCountryWithCases = includesString(countriesWithCases);
        filters.push(country => isCountryWithCases(country.code) === hasCases);
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
