import { cachifyPromise } from 'cachify-promise';
import { pluck, propEq } from 'ramda';

import { fetchCurrent } from './fetching/fetch-current';
import { fetchCsvBasedTimeline } from './fetching/fetch-timeline';
import { ApiLatest, ApiTimelineItem } from './generated/graphql-backend';
import { mergeTimeSeries } from './merging/merge-time-series';
import { mergeTimelineItemArray } from './merging/merge-timeline-item-array';
import { CountryStat } from './types/country-stat';
import { Timeline } from './types/timeline';
import { today } from './util/timeline-item-utils';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const STALE_WHILE_REVALIDATE: boolean = true;
const DEBUG: boolean = false;

export class DataSource {
    private fetchCurrent: () => Promise<readonly CountryStat[]>;
    private fetchCsvBasedTimeSeries: () => Promise<readonly Timeline[]>;

    constructor() {
        this.fetchCurrent = cachifyPromise(fetchCurrent, {
            ttl: ONE_MINUTE,
            staleWhileRevalidate: STALE_WHILE_REVALIDATE,
            debug: DEBUG,
        });
        this.fetchCsvBasedTimeSeries = cachifyPromise(fetchCsvBasedTimeline, {
            ttl: ONE_HOUR,
            staleWhileRevalidate: STALE_WHILE_REVALIDATE,
            debug: DEBUG,
        });
    }

    async getCurrent(): Promise<readonly CountryStat[]> {
        return this.fetchCurrent();
    }

    async getCurrentForCountry(countryCode: string): Promise<ApiLatest> {
        const all = await this.getCurrent();
        const found = all.find(propEq('countryCode', countryCode));
        if (found) {
            return {
                confirmed: found.confirmed,
                deceased: found.deceased,
                recovered: found.recovered,
                lastUpdated: found.lastUpdated.toISOString(),
            };
        } else {
            return today();
        }
    }

    async getGlobalTimeSeriesFromCsv(): Promise<readonly ApiTimelineItem[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        return stats.reduce(mergeTimeSeries).items;
    }

    async getAggregatedTimelineFromCsv(fn: (countryCode: string) => boolean): Promise<readonly ApiTimelineItem[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        const statsForCountry = pluck(
            'items',
            stats.filter(item => fn(item.countryCode)),
        );
        return statsForCountry.reduce(mergeTimelineItemArray, []);
    }

    async getTimelineForCountryFromCsv(countryCode: string): Promise<readonly ApiTimelineItem[]> {
        return this.getAggregatedTimelineFromCsv(cc => cc === countryCode);
    }

    async getCountryCodesWithCases(): Promise<string[]> {
        const stats = await this.fetchCurrent();
        return pluck('countryCode', stats);
    }
}
