import { ApiTimelineItem } from '../generated/graphql-backend';
import { CountryStat } from '../types/time-series-item';

export function mergeCountryStats(acc: ApiTimelineItem | undefined, stat: CountryStat): ApiTimelineItem {
    if (acc) {
        return {
            confirmed: stat.confirmed + acc.confirmed,
            deceased: stat.deceased + acc.deceased,
            recovered: stat.recovered + acc.recovered,
            date: stat.lastUpdated,
        } as ApiTimelineItem;
    } else {
        return {
            confirmed: stat.confirmed,
            deceased: stat.deceased,
            recovered: stat.recovered,
            date: stat.lastUpdated,
        };
    }
}
