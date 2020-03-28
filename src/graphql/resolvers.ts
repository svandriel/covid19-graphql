import { Moment } from 'moment';
import { isNil } from 'ramda';

import { ApiResolvers, ApiTimelineItem } from '../generated/graphql-backend';
import { LocalDate } from './custom-scalars/local-date';

export const resolvers: ApiResolvers = {
    Query: {
        globalTimeline: async (_query, { from, to }, context) => {
            const stats = await context.dataSource.getGlobalTimeSeriesFromCsv();
            return applyTimeSeriesRange({ from, to } || {}, stats);
        },
    },

    LocalDate,
};

export function applyTimeSeriesRange(
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
