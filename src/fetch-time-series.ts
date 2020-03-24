import chalk from 'chalk';

import { getCountryLookup } from './country-lookup';
import { fetchCsv } from './fetch-csv';
import { ApiTimeSeries } from './generated/graphql-backend';
import { mergeTimeSeriesArray } from './merging/merge-time-series-array';
import { invalidCountries, parseCsvRow } from './parse-csv-row';
import { statsTypes, statUrls } from './urls';

export async function fetchTimeSeries(): Promise<readonly ApiTimeSeries[]> {
    const lookup = await getCountryLookup();
    const results = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchCsv(statUrls[type]);
            return result.map(i => parseCsvRow(lookup.lookupCode, type, i));
        })
    );
    if (invalidCountries.size > 0) {
        const list = [...invalidCountries];
        console.error(`${chalk.red('ERROR')}: Invalid country names: ${list.join(', ')}`);
        invalidCountries.clear();
    }
    return results.reduce((acc, timeSeriesPerState) => {
        return mergeTimeSeriesArray(acc, timeSeriesPerState);
    }, []);
}
