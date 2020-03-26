import { cachifyPromise } from 'cachify-promise';
import { groupBy, pluck, propEq } from 'ramda';

import { fetchCurrent } from './fetch-current';
import { fetchBetterTimeSeries, fetchCsvBasedTimeSeries } from './fetch-time-series';
import { ApiTimeSeriesItem } from './generated/graphql-backend';
import { mergeCountryStats } from './merging/merge-country-stats';
import { mergeTimeSeries } from './merging/merge-time-series';
import { CountryStat, TimeSeries } from './types/time-series-item';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const STALE_WHILE_REVALIDATE: boolean = false;
const DEBUG: boolean = false;

export class DataSource {
    private fetchCurrent: () => Promise<readonly CountryStat[]>;
    private fetchCsvBasedTimeSeries: () => Promise<readonly TimeSeries[]>;
    private fetchTimeSeries: () => Promise<readonly CountryStat[]>;

    constructor() {
        this.fetchCurrent = cachifyPromise(fetchCurrent, {
            ttl: ONE_MINUTE,
            staleWhileRevalidate: STALE_WHILE_REVALIDATE,
            debug: DEBUG,
        });
        this.fetchCsvBasedTimeSeries = cachifyPromise(fetchCsvBasedTimeSeries, {
            ttl: ONE_HOUR,
            staleWhileRevalidate: STALE_WHILE_REVALIDATE,
            debug: DEBUG,
        });
        this.fetchTimeSeries = cachifyPromise(fetchBetterTimeSeries, {
            ttl: ONE_HOUR,
            staleWhileRevalidate: STALE_WHILE_REVALIDATE,
            debug: DEBUG,
        });
    }

    async getCurrent(): Promise<readonly CountryStat[]> {
        return this.fetchCurrent();
    }

    async getCurrentForCountry(countryCode: string): Promise<ApiTimeSeriesItem | undefined> {
        const all = await this.getCurrent();
        const found = all.find(propEq('countryCode', countryCode));
        if (found) {
            return {
                confirmed: found.confirmed,
                deceased: found.deceased,
                recovered: found.recovered,
                date: found.lastUpdated,
                lastUpdated: found.lastUpdated.toISOString(),
            } as ApiTimeSeriesItem;
        } else {
            return undefined;
        }
    }

    async getGlobalTimeSeriesFromCsv(): Promise<readonly ApiTimeSeriesItem[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        const start = new Date().getTime();
        const result = stats.reduce(mergeTimeSeries);
        const elapsed = new Date().getTime() - start;
        console.log(`getCsvBasedGlobalTimeSeries: ${elapsed} ms`);
        return result.items;
    }

    async getGlobalTimeSeries(): Promise<readonly ApiTimeSeriesItem[]> {
        const stats = await this.fetchTimeSeries();
        const start = new Date().getTime();
        const groups = groupBy(stat => stat.lastUpdated.format(DATE_FORMAT_REVERSE), stats);
        const result = Object.entries(groups).map(([, countryStats]) => {
            return countryStats.reduce(
                mergeCountryStats,
                undefined as ApiTimeSeriesItem | undefined,
            ) as ApiTimeSeriesItem;
        });
        const elapsed = new Date().getTime() - start;
        console.log(`getGlobalTimeSeries: ${elapsed} ms`);
        return result;
    }

    async getTimelineForCountryFromCsv(countryCode: string): Promise<readonly ApiTimeSeriesItem[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        const start = new Date().getTime();
        const statsForCountry = stats.filter(propEq('countryCode', countryCode));
        const merged = statsForCountry.reduce(mergeTimeSeries);
        const result = merged.items;
        const elapsed = new Date().getTime() - start;
        console.log(`getCsvBasedTimelineForCountry ${countryCode}: ${elapsed} ms`);

        return result;
    }

    async getTimelineForCountry(countryCode: string): Promise<readonly ApiTimeSeriesItem[]> {
        const allTimeSeriesItems = await this.fetchTimeSeries();
        // const start = new Date().getTime();

        const filtered = allTimeSeriesItems.filter(c => c.countryCode === countryCode);
        const result = filtered.map(item => ({
            date: item.lastUpdated,
            confirmed: item.confirmed,
            deceased: item.deceased,
            recovered: item.recovered,
        }));
        // const elapsed = new Date().getTime() - start;
        // console.log(`getTimelineForCountry '${countryCode}': ${elapsed} ms`);

        return result;
    }

    async getCountryCodesWithCases(): Promise<string[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        return pluck('countryCode', stats);
    }
}
