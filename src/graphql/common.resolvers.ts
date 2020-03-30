import { isNil } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { ApiResolvers, ApiTimelineItem } from '../generated/graphql-backend';
import { mergeCountryStats } from '../merging/merge-country-stats';
import { TimeRange } from '../types/time-range';
import { today } from '../util/timeline-item-utils';
import { countryPredicate } from './country-predicate';
import { LocalDate } from './custom-scalars/local-date';

export const resolvers: ApiResolvers = {
    Query: {
        timeline: async (_query, args, context) => {
            const lookup = await getCountryLookup();
            const { from, to } = args;
            const predicate = countryPredicate(lookup, args);
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(predicate);
            return applyTimelineRange({ from, to } || {}, stats);
        },
        latest: async (_query, args, context) => {
            const lookupPromise = getCountryLookup();
            const current = await context.dataSource.getCurrent();
            const predicate = countryPredicate(await lookupPromise, args);
            const filtered = current.filter(stat => predicate(stat.countryCode));
            return filtered.reduce(mergeCountryStats, today());
        },
    },

    LocalDate,
};

export function applyTimelineRange(
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
