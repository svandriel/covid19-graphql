import { cachifyPromise } from 'cachify-promise';
import chalk from 'chalk';
import { groupBy, pluck, prop, uniq, uniqBy } from 'ramda';

import { countryAliases, missingCountries } from './country-aliases';
import { fetchCsv } from './csv/fetch-csv';

const DOWNLOAD_URL =
    'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv';

export const getCountryLookup = cachifyPromise(getCountryLookupUncached);

async function getCountryLookupUncached(): Promise<CountryLookup> {
    const response = await fetchCsv(DOWNLOAD_URL);
    const list: Country[] = response
        .map(row => ({
            code: row['alpha-2'],
            name: row.name,
            region: row.region,
            subRegion: row['sub-region'],
        }))
        .concat(missingCountries);

    const regionNames = uniq(pluck('region', list));
    const countriesPerRegion = groupBy(prop('region'), list);

    const subRegionNames = uniq(pluck('subRegion', list));
    const countriesPerSubRegion = groupBy(prop('subRegion'), list);

    const uniqueSubRegionCountries = uniqBy(c => c.subRegion, list);
    const regionPerSubRegion = uniqueSubRegionCountries.reduce((acc, item) => {
        acc[item.subRegion] = item.region;
        return acc;
    }, {} as Record<string, string>);

    const subRegionsByRegionName = uniqueSubRegionCountries.reduce((acc, item) => {
        acc[item.region] = (acc[item.region] || []).concat(item.subRegion);
        return acc;
    }, {} as Record<string, string[]>);

    const lookupByCode = list.reduce((acc, country) => {
        acc[country.code] = country;
        return acc;
    }, {} as Record<string, Country>);
    const lookupByName = list.reduce((acc, country) => {
        acc[country.name] = country;
        return acc;
    }, {} as Record<string, Country>);

    // Add aliases to code lookup
    Object.entries(countryAliases).forEach(([wrongName, correctName]) => {
        const correctCode = lookupByName[correctName];
        if (correctCode) {
            lookupByName[wrongName] = correctCode;
        } else {
            console.error(`${chalk.red('ERROR')}: Invalid alias: ${correctName} for '${wrongName}' does not exist`);
        }
    });

    return {
        list,
        regionNames,
        subRegionNames,
        lookupByName,
        lookupByCode,
        countriesPerRegion,
        countriesPerSubRegion,
        regionPerSubRegion,
        subRegionsByRegionName,
    };
}

export interface CountryLookup {
    list: Country[];
    regionNames: string[];
    subRegionNames: string[];
    lookupByCode: Record<string, Country>;
    lookupByName: Record<string, Country>;
    countriesPerRegion: Record<string, Country[]>;
    countriesPerSubRegion: Record<string, Country[]>;
    regionPerSubRegion: Record<string, string>;
    subRegionsByRegionName: Record<string, string[]>;
}

export interface Country {
    code: string;
    name: string;
    region: string;
    subRegion: string;
}
