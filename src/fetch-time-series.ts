import chalk from 'chalk';
import moment from 'moment';
import { last, uniq } from 'ramda';

import { getCountryLookup } from './country-lookup';
import { CsvContent, fetchCsv } from './fetch-csv';
import { fetchPagedEsriData } from './fetch-esri-data';
import { mergeTimeSeriesArray } from './merging/merge-time-series-array';
import { invalidCountries, parseCsvRow } from './parse-csv-row';
import { EsriHistoryStat } from './types/esri';
import { StatsType, statsTypes } from './types/stats-type';
import { CountryStat, TimeSeries } from './types/time-series-item';
import { statUrls } from './urls';
import { compact } from './util/compact';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

const RUN_DEBUG_COUNTS: boolean = false;

const TIMELINE_URL =
    'https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/4/query';

export async function fetchCsvBasedTimeSeries(): Promise<readonly TimeSeries[]> {
    const lookup = await getCountryLookup();
    const results: ReadonlyArray<ReadonlyArray<TimeSeries>> = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchCsv(statUrls[type]);
            debugCheckTotalConfirmed(type, result);
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
    debugCheckTotalConfirmedAgain(results);
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

function debugCheckTotalConfirmed(type: StatsType, result: CsvContent): void {
    if (!RUN_DEBUG_COUNTS) {
        return;
    }
    const someDate = '3/26/20';
    const total = result.reduce((acc, row) => {
        const count = parseInt(row[someDate], 10);
        return acc + count;
    }, 0);
    console.log(`Total ${type} on ${someDate}: ${total}`);
}

function debugCheckTotalConfirmedAgain(results: ReadonlyArray<ReadonlyArray<TimeSeries>>): void {
    if (!RUN_DEBUG_COUNTS) {
        return;
    }
    const confirmedSeries = results.find(r => {
        const china = r.find(item => item.countryCode === 'CN');
        if (china) {
            const lastChina = last(china.items);
            return lastChina?.confirmed || 0 > 0;
        } else {
            return false;
        }
    });
    if (confirmedSeries) {
        const total = confirmedSeries.reduce((acc, item) => {
            const yesterday = item.items.find(i => i.date.format(DATE_FORMAT_REVERSE) === '2020-03-26');
            if (yesterday) {
                return acc + yesterday.confirmed;
            } else {
                return acc;
            }
        }, 0);
        console.log(`Total confirmed on '2020-03-26': ${total}`);
    } else {
        console.log('not found');
    }
}
