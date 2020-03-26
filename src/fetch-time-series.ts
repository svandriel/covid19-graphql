import chalk from 'chalk';
import moment from 'moment';
import { uniq } from 'ramda';

import { getCountryLookup } from './country-lookup';
import { fetchCsv } from './fetch-csv';
import { fetchPagedEsriData } from './fetch-esri-data';
import { mergeTimeSeriesArray } from './merging/merge-time-series-array';
import { invalidCountries, parseCsvRow } from './parse-csv-row';
import { EsriHistoryStat } from './types/esri';
import { statsTypes } from './types/stats-type';
import { CountryStat, TimeSeries } from './types/time-series-item';
import { statUrls } from './urls';
import { compact } from './util/compact';

const TIMELINE_URL =
    'https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/4/query';

export async function fetchCsvBasedTimeSeries(): Promise<readonly TimeSeries[]> {
    const lookup = await getCountryLookup();
    const results: ReadonlyArray<ReadonlyArray<TimeSeries>> = await Promise.all(
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

export async function fetchBetterTimeSeries(): Promise<readonly CountryStat[]> {
    const lookupPromise = getCountryLookup();
    const results = await fetchPagedEsriData<EsriHistoryStat>(TIMELINE_URL, {
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
