import { fetchCsv } from './fetch-csv';
import { parseCsvRow } from './parse-csv-row';
import { StatsType } from './types/stats-type';
import { TimeSeriesPerCountryAndState } from './types/time-series';
import { statsTypes, statUrls } from './urls';

export async function fetchSingleStat(statsType: StatsType): Promise<TimeSeriesPerCountryAndState<number>> {
    const rows = await fetchCsv(statUrls[statsType]);
    const mappedRows = rows.map(parseCsvRow);
    const result = mappedRows.reduce((acc, item) => {
        const countryCodeIso2 = item.countryCodeIso2 || 'none';
        acc[countryCodeIso2] = acc[countryCodeIso2] || {};
        acc[countryCodeIso2][item.provinceState || 'all'] = item;
        return acc;
    }, {} as TimeSeriesPerCountryAndState<number>);
    return result;
}

export async function fetchAllStats(): Promise<Record<StatsType, TimeSeriesPerCountryAndState<number>>> {
    const results = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchSingleStat(type);
            return {
                type,
                result
            };
        })
    );
    return results.reduce((acc, item) => {
        acc[item.type] = item.result;
        return acc;
    }, {} as Record<StatsType, TimeSeriesPerCountryAndState<number>>);
}
