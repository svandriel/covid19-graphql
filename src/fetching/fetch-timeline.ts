import chalk from 'chalk';
import moment from 'moment';
import { uniq } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { fetchCsv } from '../csv/fetch-csv';
import { invalidCountries, parseCsvRow } from '../csv/parse-csv-row';
import { fetchPagedEsriData } from '../esri/fetch-esri-data';
import { mergeTimeSeriesArray } from '../merging/merge-time-series-array';
import { CountryStat } from '../types/country-stat';
import { EsriHistoryStat } from '../types/esri';
import { statsTypes } from '../types/stats-type';
import { Timeline } from '../types/timeline';
import { ESRI_TIMELINE_URL, statUrls } from '../urls';
import { compact } from '../util/compact';

export async function fetchCsvBasedTimeline(): Promise<readonly Timeline[]> {
    const lookup = await getCountryLookup();
    const results: ReadonlyArray<ReadonlyArray<Timeline>> = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchCsv(statUrls[type]);
            const converted = result.map(i => {
                try {
                    return parseCsvRow(lookup.lookupByName, type, i);
                } catch (err) {
                    console.error(`fetchCsvBasedTimeSeries ${chalk.red('ERROR')}: ${err}`);
                    return undefined;
                }
            });

            return compact(converted);
        }),
    );
    if (invalidCountries.size > 0) {
        const list = [...invalidCountries];
        console.error(`${chalk.red('ERROR')}: Invalid country names: ${list.join(', ')}`);
        invalidCountries.clear();
    }
    return results.reduce(mergeTimeSeriesArray);
}

export async function fetchTimeSeries(): Promise<readonly CountryStat[]> {
    const lookupPromise = getCountryLookup();
    const results = await fetchPagedEsriData<EsriHistoryStat>(ESRI_TIMELINE_URL, {
        offset: 0,
        count: 1000,
        orderBy: {
            Last_Update: 'asc',
        },
    });
    const lookup = await lookupPromise;
    const countriesNotFound: string[] = [];
    const converted = results.map(r => {
        const countryName = r.Country_Region;
        const country = lookup.lookupByName[countryName];
        if (!country) {
            countriesNotFound.push(countryName);
            return undefined;
        }
        return {
            countryCode: country.code,
            confirmed: r.Confirmed,
            deceased: r.Deaths || 0,
            recovered: r.Recovered || 0,
            lastUpdated: moment(r.Last_Update),
        };
    });
    if (countriesNotFound.length > 0) {
        console.error(`fetchBetterTimeSeries ${chalk.red('ERROR')}: countries not found: ${uniq(countriesNotFound)}`);
    }
    return compact(converted);
}
