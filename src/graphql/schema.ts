import { IResolvers, makeExecutableSchema } from 'apollo-server-express';
import moment from 'moment';
import { allPass, isNil, last } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { ApiCountry, ApiResolvers, ApiTimeSeriesItem, ApiTimeSeriesWhere } from '../generated/graphql-backend';
import { paginate } from '../util/paginate';
import { LocalDate } from './custom-scalars/local-date';
import { typeDefs } from './schema.graphql';

const resolvers: ApiResolvers = {
    Query: {
        ping: () => 'pong',
        globalHistory: async (_query, { where }, context) => {
            const stats = await context.dataSource.fetchGlobal();
            return applyTimeSeriesRange(where || {}, stats);
        },
        country: async (_query, { code }) => {
            const lookup = await getCountryLookup();
            const upperCode = code.toUpperCase();
            const name = lookup.lookupName[upperCode];
            if (!name) {
                return (undefined as any) as ApiCountry;
            }
            return {
                code: upperCode,
                name,
                history: [],
                latest: (undefined as any) as ApiTimeSeriesItem
            };
        },
        countries: async (_query, { offset, count, where }, context) => {
            const lookup = await getCountryLookup();
            const countries = lookup.list as ApiCountry[];
            const { search, ignore, hasCases } = where || {};
            const filters: Array<(item: ApiCountry) => boolean> = [];
            if (search) {
                const upperSearch = search.toUpperCase();
                filters.push((item: ApiCountry) => {
                    return item.name.toUpperCase().indexOf(upperSearch) !== -1 || item.code.indexOf(upperSearch) !== -1;
                });
            }
            if (ignore) {
                filters.push(country => !ignore.includes(country.code));
            }
            if (!isNil(hasCases)) {
                const countriesWithCases = await context.dataSource.fetchCountryCodesWithCases();
                filters.push(country => countriesWithCases.includes(country.code) === hasCases);
            }
            const filteredCountries = countries.filter(allPass(filters));

            return paginate({ offset, count }, filteredCountries);
        }
    },

    Country: {
        history: async (country, { where }, context) => {
            const countries = await context.dataSource.fetchPerCountry();
            const stats = countries[country.code] || [emptyTimeSeriesItem()];
            if (where) {
                return applyTimeSeriesRange(where, stats);
            } else {
                return stats;
            }
        },
        latest: async (country, {}, context) => {
            const countries = await context.dataSource.fetchPerCountry();
            const countryTimeline = countries[country.code];
            if (countryTimeline) {
                const latest = last(countryTimeline);
                return latest || emptyTimeSeriesItem();
            } else {
                return emptyTimeSeriesItem();
            }
        }
    },
    LocalDate
};

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as IResolvers
});

function applyTimeSeriesRange(where: ApiTimeSeriesWhere, stats: readonly ApiTimeSeriesItem[]): ApiTimeSeriesItem[] {
    const { from, to } = where;
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

function emptyTimeSeriesItem(): ApiTimeSeriesItem {
    return {
        confirmed: 0,
        deceased: 0,
        recovered: 0,
        date: moment()
    };
}
