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

export interface TimeRange {
    from?: Moment | null;
    to?: Moment | null;
}

export function applyTimeSeriesRange(
    { from, to }: TimeRange,
    timeline: readonly ApiTimelineItem[],
): readonly ApiTimelineItem[] {
    if (isNil(from) && isNil(to)) {
        return timeline;
    }
    let fromIndex: number = 0;
    let toIndex: number = timeline.length;
    if (from) {
        fromIndex = timeline.findIndex(i => i.date >= from);
        if (fromIndex === -1) {
            fromIndex = 0;
        }
    }
    if (to) {
        toIndex = timeline.findIndex(i => i.date >= to);
        if (toIndex === -1) {
            toIndex = timeline.length;
        }
    }
    return timeline.slice(fromIndex, toIndex);
}
