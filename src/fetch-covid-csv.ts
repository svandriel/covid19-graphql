import { fetchCsv } from './fetch-csv';
import { mergeTimeSeriesArray } from './merge-time-series-array';
import { parseCsvRow } from './parse-csv-row';
import { TimeSeries } from './types/time-series';
import { statsTypes, statUrls } from './urls';

export async function fetchCovidStats(): Promise<TimeSeries[]> {
    const results = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchCsv(statUrls[type]);
            return result.map(i => parseCsvRow(type, i));
        })
    );
    return results.reduce((acc, timeSeriesPerState) => {
        return mergeTimeSeriesArray(acc, timeSeriesPerState);
    }, []);
}
