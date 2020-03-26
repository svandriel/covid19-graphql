import { ApiTimeSeriesItem } from '../generated/graphql-backend';
import { CountryStat } from '../types/time-series-item';

export function mergeCountryStats(acc: ApiTimeSeriesItem | undefined, stat: CountryStat): ApiTimeSeriesItem {
    if (acc) {
        return {
            confirmed: stat.confirmed + acc.confirmed,
            deceased: stat.deceased + acc.deceased,
            recovered: stat.recovered + acc.recovered,
            date: stat.lastUpdated,
        } as ApiTimeSeriesItem;
    } else {
        return {
            confirmed: stat.confirmed,
            deceased: stat.deceased,
            recovered: stat.recovered,
            date: stat.lastUpdated,
        };
    }
}
