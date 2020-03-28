import { Moment } from 'moment';
import { allPass, isNil, pluck, uniq } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { ApiResolvers, ApiTimelineItem } from '../generated/graphql-backend';
import { TimeSeries } from '../types/time-series-item';
import { makeStringLookup } from '../util/make-lookup';
import { LocalDate } from './custom-scalars/local-date';

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
                if (regions) {
                    const includedCountries = uniq(regions).flatMap(
                        includedRegion => lookup.countriesPerRegion[includedRegion],
                    );
                    const countryLookup = makeStringLookup(pluck('code', includedCountries));
                    filters.push(item => !!countryLookup[item.countryCode]);
                }
                if (excludeRegions) {
                    const excludedCountries = uniq(excludeRegions).flatMap(
                        excludedRegion => lookup.countriesPerRegion[excludedRegion],
                    );
                    const countryLookup = makeStringLookup(pluck('code', excludedCountries));
                    filters.push(item => !countryLookup[item.countryCode]);
                }
            }
            if (subRegions) {
                const includedCountries = uniq(subRegions).flatMap(
                    includedSubRegion => lookup.countriesPerSubRegion[includedSubRegion],
                );
                const countryLookup = makeStringLookup(pluck('code', includedCountries));
                filters.push(item => !!countryLookup[item.countryCode]);
            }
            if (excludeSubRegions) {
                const excludedCountries = uniq(excludeSubRegions).flatMap(
                    excludedSubRegion => lookup.countriesPerSubRegion[excludedSubRegion],
                );
                const countryLookup = makeStringLookup(pluck('code', excludedCountries));
                filters.push(item => !countryLookup[item.countryCode]);
            }
            if (countries) {
                const includedCountries = uniq(countries);
                const countryLookup = makeStringLookup(includedCountries);
                filters.push(item => !!countryLookup[item.countryCode]);
            }
            if (excludeCountries) {
                const excludedCountries = uniq(excludeCountries);
                const countryLookup = makeStringLookup(excludedCountries);
                filters.push(item => !countryLookup[item.countryCode]);
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
