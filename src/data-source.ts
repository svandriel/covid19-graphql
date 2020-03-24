import { cachifyPromise } from 'cachify-promise';
import { Moment } from 'moment';
import { groupBy, pluck, prop } from 'ramda';

import { fetchDailyStats } from './fetch-daily-stats';
import { fetchTimeSeries } from './fetch-time-series';
import { ApiDailyStat, ApiTimeSeries, ApiTimeSeriesItem } from './generated/graphql-backend';
import { mergeTimeSeries } from './merging/merge-time-series';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

export class DataSource {
    private fetchCovidStats: () => Promise<readonly ApiTimeSeries[]>;
    private fetchDailyStats: (date: Moment) => Promise<readonly ApiDailyStat[]>;

    constructor() {
        console.log('Creating DataSource');
        this.fetchCovidStats = cachifyPromise(fetchTimeSeries, {
            ttl: 3600 * 1000,
            staleWhileRevalidate: true,
            debug: true
        });
        this.fetchDailyStats = cachifyPromise(fetchDailyStats, {
            ttl: 3600 * 1000,
            staleWhileRevalidate: true,
            debug: true,
            cacheKeyFn: a => a.format(DATE_FORMAT_REVERSE)
        });
    }

    async fetchGlobal(): Promise<readonly ApiTimeSeriesItem[]> {
        const stats = await this.fetchCovidStats();
        const start = new Date().getTime();
        const result = stats.reduce(mergeTimeSeries);
        const elapsed = new Date().getTime() - start;
        console.log(`fetchGlobal: ${elapsed} ms`);
        return result.items;
    }

    async fetchPerCountry(): Promise<Record<string, readonly ApiTimeSeriesItem[]>> {
        const stats = await this.fetchCovidStats();
        const start = new Date().getTime();
        const grouped = groupBy(prop('countryCode'), stats);
        const result: Record<string, readonly ApiTimeSeriesItem[]> = {};
        Object.keys(grouped).forEach(key => {
            const val = grouped[key];
            const merged = val.reduce(mergeTimeSeries);
            result[key] = merged.items;
        });
        const elapsed = new Date().getTime() - start;
        console.log(`fetchPerCountry: ${elapsed} ms`);

        return result;
    }

    async fetchCountryCodesWithCases(): Promise<string[]> {
        const stats = await this.fetchCovidStats();
        return pluck('countryCode', stats);
    }

    async fetchForDate(date: Moment): Promise<readonly ApiDailyStat[]> {
        return this.fetchDailyStats(date);
    }
}
