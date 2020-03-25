import { cachifyPromise } from 'cachify-promise';
import moment from 'moment';
import { groupBy, pluck, prop, propEq } from 'ramda';

import { fetchCurrent } from './fetch-current';
import { fetchBetterTimeSeries, fetchTimeSeries } from './fetch-time-series';
import { ApiCountryStat, ApiTimeSeries, ApiTimeSeriesItem } from './generated/graphql-backend';
import { mergeTimeSeries } from './merging/merge-time-series';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

export class DataSource {
    private fetchTimeSeries: () => Promise<readonly ApiTimeSeries[]>;
    private fetchCurrent: () => Promise<readonly ApiCountryStat[]>;
    private fetchBetterTimeSeries: () => Promise<readonly ApiCountryStat[]>;

    constructor() {
        this.fetchTimeSeries = cachifyPromise(fetchTimeSeries, {
            ttl: ONE_HOUR,
            staleWhileRevalidate: true,
            debug: true,
        });
        this.fetchCurrent = cachifyPromise(fetchCurrent, {
            ttl: ONE_MINUTE,
            staleWhileRevalidate: true,
            debug: true,
        });
        this.fetchBetterTimeSeries = cachifyPromise(fetchBetterTimeSeries, {
            ttl: ONE_HOUR,
            staleWhileRevalidate: true,
            debug: true,
        });
    }

    async fetchGlobal(): Promise<readonly ApiTimeSeriesItem[]> {
        const stats = await this.fetchTimeSeries();
        const start = new Date().getTime();
        const result = stats.reduce(mergeTimeSeries);
        const elapsed = new Date().getTime() - start;
        console.log(`fetchGlobal: ${elapsed} ms`);
        return result.items;
    }

    async fetchPerCountry(): Promise<Record<string, readonly ApiTimeSeriesItem[]>> {
        const stats = await this.fetchTimeSeries();
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

    async fetchTimelineForCountry(countryCode: string): Promise<readonly ApiTimeSeriesItem[]> {
        const allTimeSeriesItems = await this.fetchBetterTimeSeries();
        const filtered = allTimeSeriesItems.filter(propEq('countryCode', countryCode));
        return filtered.map(item => ({
            date: item.date,
            confirmed: item.confirmed,
            deceased: item.deceased,
            recovered: item.recovered,
            lastUpdated: moment(item.lastUpdated || 0).toISOString(),
        }));
    }

    async fetchCountryCodesWithCases(): Promise<string[]> {
        const stats = await this.fetchTimeSeries();
        return pluck('countryCode', stats);
    }

    async fetchLatest(): Promise<readonly ApiCountryStat[]> {
        return this.fetchCurrent();
    }
}
