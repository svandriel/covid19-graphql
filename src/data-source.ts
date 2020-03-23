import { cachifyPromise } from 'cachify-promise';
import { groupBy, prop } from 'ramda';

import { fetchCovidStats } from './fetch-covid-stats';
import { ApiTimeSeries, ApiTimeSeriesItem } from './generated/graphql-backend';
import { mergeTimeSeries } from './merge-time-series';
import { timed } from './util/timed';

export class DataSource {
    private fetchCovidStats: () => Promise<readonly ApiTimeSeries[]>;

    constructor() {
        this.fetchCovidStats = cachifyPromise(fetchCovidStats, {
            ttl: 3600 * 1000,
            staleWhileRevalidate: true,
            debug: true
        });
        this.fetchPerCountry = timed(this.fetchPerCountry.bind(this));
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
}
