import { ApiTimelineItem } from '../generated/graphql-backend';
import { CountryStat } from '../types/country-stat';

export function mergeCountryStats(acc: ApiTimelineItem, stat: CountryStat): ApiTimelineItem {
    if (acc) {
        return {
            confirmed: stat.confirmed + acc.confirmed,
            deceased: stat.deceased + acc.deceased,
            recovered: stat.recovered + acc.recovered,
            date: stat.lastUpdated,
            lastUpdated: stat.lastUpdated?.toISOString() || acc.lastUpdated,
        } as ApiTimelineItem;
    } else {
        return {
            confirmed: stat.confirmed,
            deceased: stat.deceased,
            recovered: stat.recovered,
            date: stat.lastUpdated,
            lastUpdated: stat.lastUpdated?.toISOString(),
        };
    }
}
