import { cachifyPromise } from 'cachify-promise';
import { groupBy, pluck, propEq } from 'ramda';

import { fetchCurrent } from './fetch-current';
import { fetchBetterTimeSeries, fetchCsvBasedTimeSeries } from './fetch-time-series';
import { ApiTimelineItem } from './generated/graphql-backend';
import { mergeCountryStats } from './merging/merge-country-stats';
import { mergeTimeSeries } from './merging/merge-time-series';
import { mergeTimeSeriesItemArray } from './merging/merge-time-series-item-array';
import { CountryStat, TimeSeries } from './types/time-series-item';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const STALE_WHILE_REVALIDATE: boolean = true;
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

    async getCurrentForCountry(countryCode: string): Promise<ApiTimelineItem | undefined> {
        const all = await this.getCurrent();
        const found = all.find(propEq('countryCode', countryCode));
        if (found) {
            return {
                confirmed: found.confirmed,
                deceased: found.deceased,
                recovered: found.recovered,
                date: found.lastUpdated,
                lastUpdated: found.lastUpdated.toISOString(),
            } as ApiTimelineItem;
        } else {
            return undefined;
        }
    }

    async getGlobalTimeSeriesFromCsv(): Promise<readonly ApiTimelineItem[]> {
        const stats = await this.fetchCsvBasedTimeSeries();

        const start = new Date().getTime();
        const result = stats.reduce(mergeTimeSeries).items;
        const elapsed = new Date().getTime() - start;
        console.log(`getCsvBasedGlobalTimeSeries: ${elapsed} ms`);
        return result;
    }

    /**
     * Deprecated: Not used at the moment because it doesn't contains recoveries
     */
    async getGlobalTimeSeries(): Promise<readonly ApiTimelineItem[]> {
        const stats = await this.fetchTimeSeries();
        const start = new Date().getTime();
        const groups = groupBy(stat => stat.lastUpdated.format(DATE_FORMAT_REVERSE), stats);
        const result = Object.entries(groups).map(([, countryStats]) => {
            return countryStats.reduce(mergeCountryStats, undefined as ApiTimelineItem | undefined) as ApiTimelineItem;
        });
        const elapsed = new Date().getTime() - start;
        console.log(`getGlobalTimeSeries: ${elapsed} ms`);
        return result;
    }

    async getTimelineForCountryFromCsv(countryCode: string): Promise<readonly ApiTimelineItem[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        // const start = new Date().getTime();
        const statsForCountry = pluck('items', stats.filter(propEq('countryCode', countryCode)));
        const result = statsForCountry.reduce(mergeTimeSeriesItemArray, []);
        // const elapsed = new Date().getTime() - start;
        // console.log(`getTimelineForCountryFromCsv ${countryCode}: ${elapsed} ms`);

        return result;
    }

    /**
     * Deprecated: Not used at the moment because it lacks recoveries
     * @param countryCode
     */
    async getTimelineForCountry(countryCode: string): Promise<readonly ApiTimelineItem[]> {
        const allTimeSeriesItems = await this.fetchTimeSeries();
        const start = new Date().getTime();

        const filtered = allTimeSeriesItems.filter(c => c.countryCode === countryCode);
        const result = filtered.map(item => ({
            date: item.lastUpdated,
            confirmed: item.confirmed,
            deceased: item.deceased,
            recovered: item.recovered,
        }));
        const elapsed = new Date().getTime() - start;
        console.log(`getTimelineForCountry '${countryCode}': ${elapsed} ms`);

        return result;
    }

    async getCountryCodesWithCases(): Promise<string[]> {
        const stats = await this.fetchCsvBasedTimeSeries();
        return pluck('countryCode', stats);
    }
}
