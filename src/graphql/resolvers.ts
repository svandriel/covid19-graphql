import { Moment } from 'moment';
import { allPass, isNil } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { ApiCountry, ApiResolvers, ApiTimelineItem } from '../generated/graphql-backend';
import { paginate } from '../util/paginate';
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
            const country = lookup.lookupByCode[upperCode];
            if (!country) {
                return (undefined as any) as ApiCountry;
            }
            return {
                code: upperCode,
                name: country.name,
                region: country.region,
                subRegion: country.subRegion,
                timeline: [],
                latest: (undefined as any) as ApiTimelineItem,
            };
        },
        countries: async (_query, { offset, count, filter }, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.list as ApiCountry[];
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
            const filteredCountries = countries.filter(allPass(filters));

            return paginate({ offset, count }, filteredCountries);
        },
    },

    Country: {
        timeline: async (country, { from, to }, context) => {
            const stats = await context.dataSource.getTimelineForCountryFromCsv(country.code);
            if (from || to) {
                return applyTimeSeriesRange({ from, to }, stats);
            } else {
                return stats;
            }
        },
        latest: async (country, _args, context) => {
            return context.dataSource.getCurrentForCountry(country.code) as Promise<ApiTimelineItem>;
        },
    },
    LocalDate,
};

function applyTimeSeriesRange(
    { from, to }: { from?: Moment | null; to?: Moment | null },
    stats: readonly ApiTimelineItem[],
): ApiTimelineItem[] {
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
