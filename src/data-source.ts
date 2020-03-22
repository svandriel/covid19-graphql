import { cachifyPromise } from 'cachify-promise';

import { fetchAllStats } from './fetch-covid-csv';
import { mergeStats } from './merge-stats';
import { StatsType } from './types/stats-type';
import { DailyStat, TimeSeriesPerCountryAndState } from './types/time-series';

export class DataSource {
    fetchAll: () => Promise<Record<StatsType, TimeSeriesPerCountryAndState<number>>> = cachifyPromise(fetchAllStats, {
        ttl: 3600 * 1000,
        staleWhileRevalidate: true
    });

    async fetchMerged(): Promise<TimeSeriesPerCountryAndState<DailyStat>> {
        const all = await this.fetchAll();
        return mergeStats(all);
    }
}
