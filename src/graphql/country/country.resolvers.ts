import { allPass, includes, isNil } from 'ramda';

import { Country, getCountryLookup } from '../../country-lookup';
import {
    ApiCountry,
    ApiCountryFilter,
    ApiLatest,
    ApiRegion,
    ApiResolvers,
    ApiSubRegion,
} from '../../generated/graphql-backend';
import { includesString } from '../../util/includes-string';
import { normalizeString } from '../../util/normalize-string';
import { paginate } from '../../util/paginate';
import { applyTimelineRange } from '../common.resolvers';
import { Context } from '../context';
import { countrySort } from './country-sort';

export const resolvers: ApiResolvers = {
    Query: {
        country: async (_query, { code }) => {
            const lookup = await getCountryLookup();
            const upperCode = code.toUpperCase();
            return createApiCountry(lookup.lookupByCode[upperCode]);
        },
        countries: async (_query, args, context) => {
            const lookup = await getCountryLookup();
            const countries = await applyCountryFilter(args, context, (lookup.list as any[]) as ApiCountry[]);
            const sorted = await countrySort(context.dataSource, args, countries);
            return paginate(args, sorted);
        },
    },

    Country: {
        timeline: async (country, { from, to }, context) => {
            const stats = await context.dataSource.getTimelineForCountryFromCsv(country.code);
            return applyTimelineRange({ from, to }, stats);
        },
        latest: async (country, _args, context) => {
            return context.dataSource.getCurrentForCountry(country.code);
        },
    },

    Region: {
        countries: async (region, args, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerRegion[region.name].map(createApiCountry);
            const filteredCountries = await applyCountryFilter(args, context, countries);
            const sorted = await countrySort(context.dataSource, args, filteredCountries);
            return paginate(args, sorted);
        },
    },

    SubRegion: {
        countries: async (subRegion, args, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.countriesPerSubRegion[subRegion.name].map(createApiCountry);
            const filteredCountries = await applyCountryFilter(args, context, countries);
            const sorted = await countrySort(context.dataSource, args, filteredCountries);
            return paginate(args, sorted);
        },
    },
};

interface CountryOptions {
    offset: number;
    count: number;
    filter?: ApiCountryFilter | null;
}

async function applyCountryFilter(args: CountryOptions, context: Context, input: ApiCountry[]): Promise<ApiCountry[]> {
    const { filter } = args;
    const { search, include, exclude, hasCases } = filter || {};
    const filters: Array<(item: ApiCountry) => boolean> = [];
    if (search) {
        const upperSearch = normalizeString(search);
        filters.push(
            (item: ApiCountry) => includes(upperSearch, normalizeString(item.name)) || includes(upperSearch, item.code),
        );
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
    return countries.filter(allPass(filters));
}

function createApiCountry(country: Country | undefined): ApiCountry {
    return country
        ? {
              code: country.code,
              name: country.name,
              region: (undefined as any) as ApiRegion,
              subRegion: (undefined as any) as ApiSubRegion,
              timeline: [],
              latest: (undefined as any) as ApiLatest,
          }
        : ((undefined as any) as ApiCountry);
}
