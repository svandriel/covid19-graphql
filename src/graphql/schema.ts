import { IResolvers, makeExecutableSchema } from 'apollo-server-express';
import moment from 'moment';
import { last } from 'ramda';

import { getCountryNameFromIso2 } from '../countries';
import { ApiCountry, ApiResolvers, ApiTimeSeriesItem } from '../generated/graphql-backend';
import { LocalDate } from './custom-scalars/local-date';
import { typeDefs } from './schema.graphql';

const resolvers: ApiResolvers = {
    Query: {
        ping: () => 'pong',
        globalHistory: async (_query, { where }, context) => {
            const stats = await context.dataSource.fetchGlobal();
            if (where) {
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
            return stats;
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
        }
    },

    Country: {
        history: async (country, {}, context) => {
            const countries = await context.dataSource.fetchPerCountry();
            return countries[country.code];
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
function emptyTimeSeriesItem(): ApiTimeSeriesItem {
    return {
        confirmed: 0,
        deceased: 0,
        recovered: 0,
        date: moment()
    };
}
