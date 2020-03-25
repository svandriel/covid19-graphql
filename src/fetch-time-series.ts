import chalk from 'chalk';
import moment from 'moment';

import { getCountryLookup } from './country-lookup';
import { fetchCsv } from './fetch-csv';
import { fetchPagedEsriData } from './fetch-esri-data';
import { ApiCountry, ApiCountryStat, ApiTimeSeries } from './generated/graphql-backend';
import { mergeTimeSeriesArray } from './merging/merge-time-series-array';
import { invalidCountries, parseCsvRow } from './parse-csv-row';
import { EsriHistoryStat } from './types/esri';
import { statsTypes } from './types/stats-type';
import { statUrls } from './urls';
import { propEq } from 'ramda';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

const TIMELINE_URL =
    'https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/4/query';

export async function fetchTimeSeries(): Promise<readonly ApiTimeSeries[]> {
    const lookup = await getCountryLookup();
    const results = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchCsv(statUrls[type]);
            return result.map(i => parseCsvRow(lookup.lookupCode, type, i));
        }),
    );
    if (invalidCountries.size > 0) {
        const list = [...invalidCountries];
        console.error(`${chalk.red('ERROR')}: Invalid country names: ${list.join(', ')}`);
        invalidCountries.clear();
    }
    return results.reduce(mergeTimeSeriesArray);
}

fetchBetterTimeSeries().then(results => {
    console.log(`Got ${results.length} results!`);
    const nl = results.filter(propEq('countryCode', 'NL'));
    console.log(
        nl.map(i => {
            const dateStr = i.date.format(DATE_FORMAT_REVERSE);
            return `${dateStr} - confirmed ${i.confirmed}, deceased ${i.deceased}, recovered ${i.recovered}`;
        }),
    );
});

export async function fetchBetterTimeSeries(): Promise<readonly ApiCountryStat[]> {
    const lookupPromise = getCountryLookup();
    const results = await fetchPagedEsriData<EsriHistoryStat>(TIMELINE_URL, {
        offset: 0,
        count: 1000,
        orderBy: {
            Last_Update: 'asc',
        },
    });
    const lookup = await lookupPromise;
    return results.map(r => {
        const lastUpdate = moment(r.Last_Update);
        return {
            countryCode: lookup.lookupCode[r.Country_Region],
            country: (undefined as any) as ApiCountry,
            confirmed: r.Confirmed,
            deceased: r.Deaths || 0,
            recovered: r.Recovered || 0,
            date: lastUpdate,
            lastUpdated: r.Last_Update,
        };
    });
}
