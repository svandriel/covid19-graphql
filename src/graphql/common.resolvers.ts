import { Moment } from 'moment';
import { allPass, complement, isNil, uniq } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { ApiResolvers, ApiTimelineItem } from '../generated/graphql-backend';
import { TimeSeries } from '../types/time-series-item';
import { LocalDate } from './custom-scalars/local-date';
import { createCountryFilter, createRegionFilter, createSubRegionFilter } from './filters';

export const resolvers: ApiResolvers = {
    Query: {
        timeline: async (_query, args, context) => {
            const lookup = await getCountryLookup();
            const {
                from,
                to,
                regions,
                excludeRegions,
                subRegions,
                excludeSubRegions,
                countries,
                excludeCountries,
            } = args;

            const filters: Array<(item: TimeSeries) => boolean> = [];
            if (regions) {
                filters.push(createRegionFilter(lookup, regions));
            }
            if (excludeRegions) {
                filters.push(complement(createRegionFilter(lookup, excludeRegions)));
            }
            if (subRegions) {
                filters.push(createSubRegionFilter(lookup, subRegions));
            }
            if (excludeSubRegions) {
                filters.push(complement(createSubRegionFilter(lookup, excludeSubRegions)));
            }
            if (countries) {
                filters.push(createCountryFilter(uniq(countries)));
            }
            if (excludeCountries) {
                filters.push(complement(createCountryFilter(uniq(excludeCountries))));
            }
            const stats = await context.dataSource.getAggregatedTimelineFromCsv(allPass(filters));
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
