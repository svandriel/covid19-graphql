import { ApiTimelineItem } from '../generated/graphql-backend';
import { CountryStat } from '../types/country-stat';

export function mergeCountryStats(acc: ApiTimelineItem, stat: CountryStat): ApiTimelineItem {
    if (acc) {
        return {
            confirmed: stat.confirmed + acc.confirmed,
            deceased: stat.deceased + acc.deceased,
            recovered: stat.recovered + acc.recovered,
            deltaConfirmed: acc.deltaConfirmed,
            deltaDeceased: acc.deltaDeceased,
            deltaRecovered: acc.deltaRecovered,
            date: stat.lastUpdated,
            lastUpdated: stat.lastUpdated?.toISOString() || acc.lastUpdated,
        };
    } else {
        return {
            confirmed: stat.confirmed,
            deceased: stat.deceased,
            recovered: stat.recovered,
            deltaConfirmed: 0,
            deltaDeceased: 0,
            deltaRecovered: 0,
            date: stat.lastUpdated,
            lastUpdated: stat.lastUpdated?.toISOString(),
        };
    }
}
