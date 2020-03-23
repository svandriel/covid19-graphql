import { IResolvers, makeExecutableSchema } from 'apollo-server-express';
import moment from 'moment';
import { last } from 'ramda';

import { getCountryCodes, getCountryNameFromIso2 } from '../countries';
import { ApiCountry, ApiResolvers, ApiTimeSeriesItem, ApiTimeSeriesWhere } from '../generated/graphql-backend';
import { paginate } from '../util/paginate';
import { LocalDate } from './custom-scalars/local-date';
import { typeDefs } from './schema.graphql';

const resolvers: ApiResolvers = {
    Query: {
        ping: () => 'pong',
        globalHistory: async (_query, { where }, context) => {
            const stats = await context.dataSource.fetchGlobal();
            if (where) {
                return applyTimeSeriesRange(where, stats);
            } else {
                return stats;
            }
        },
        country: (_query, { code }) => {
            const upperCode = code.toUpperCase();
            const name = getCountryNameFromIso2(upperCode);
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
        countries: (_query, { offset, count }) => {
            const codes = getCountryCodes();
            const countries: ApiCountry[] = codes.map(code => ({
                code,
                name: getCountryNameFromIso2(code) || code,
                history: [],
                latest: (undefined as any) as ApiTimeSeriesItem
            }));

            return paginate({ offset, count }, countries);
        }
    },

    Country: {
        history: async (country, { where }, context) => {
            const countries = await context.dataSource.fetchPerCountry();
            const stats = countries[country.code];
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
