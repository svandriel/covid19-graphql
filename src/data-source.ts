import { cachifyPromise } from 'cachify-promise';
import { groupBy, prop } from 'ramda';

import { convertTimeSeriesItem } from './conversion';
import { fetchCovidStats } from './fetch-covid-csv';
import { ApiTimeSeriesItem } from './generated/graphql-backend';
import { mergeTimeSeries } from './merge-time-series';
import { TimeSeries } from './types/time-series';
import { timed } from './util/timed';

export class DataSource {
    private fetchCovidStats: () => Promise<TimeSeries[]>;

    constructor() {
        this.fetchCovidStats = cachifyPromise(fetchCovidStats, {
            ttl: 3600 * 1000,
            staleWhileRevalidate: true,
            debug: true
        });
        this.fetchPerCountry = timed(this.fetchPerCountry.bind(this));
    }

    async fetchGlobal(): Promise<ApiTimeSeriesItem[]> {
        const stats = await this.fetchCovidStats();
        const start = new Date().getTime();
        const result = stats.reduce(mergeTimeSeries);
        const elapsed = new Date().getTime() - start;
        console.log(`fetchGlobal: ${elapsed} ms`);
        return result.items.map(convertTimeSeriesItem);
    }

    async fetchPerCountry(): Promise<Record<string, ApiTimeSeriesItem[]>> {
        const stats = await this.fetchCovidStats();
        const start = new Date().getTime();
        const grouped = groupBy(prop('countryCodeIso2'), stats);
        const result: Record<string, ApiTimeSeriesItem[]> = {};
        Object.keys(grouped).forEach(key => {
            const val = grouped[key];
            const merged = val.reduce(mergeTimeSeries);
            result[key] = merged.items.map(convertTimeSeriesItem);
        });
        const elapsed = new Date().getTime() - start;
        console.log(`fetchPerCountry: ${elapsed} ms`);

        return result;
    }
}
