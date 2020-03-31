import { ApiLatest } from '../generated/graphql-backend';
import { CountryStat } from '../types/country-stat';

export function mergeCountryStats(acc: ApiLatest, stat: CountryStat): ApiLatest {
    if (acc) {
        return {
            confirmed: stat.confirmed + acc.confirmed,
            deceased: stat.deceased + acc.deceased,
            recovered: stat.recovered + acc.recovered,
            lastUpdated: stat.lastUpdated?.toISOString() || acc.lastUpdated,
        };
    } else {
        return {
            confirmed: stat.confirmed,
            deceased: stat.deceased,
            recovered: stat.recovered,
            lastUpdated: stat.lastUpdated?.toISOString(),
        };
    }
}
