import { cachifyPromise } from 'cachify-promise';
import chalk from 'chalk';

import { countryAliases, missingCountries } from './country-aliases';
import { fetchCsv } from './fetch-csv';

const DOWNLOAD_URL =
    'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv';

export const getCountryLookup = cachifyPromise(getCountryLookupUncached);

async function getCountryLookupUncached(): Promise<CountryLookup> {
    const response = await fetchCsv(DOWNLOAD_URL);
    const list = response
        .map(row => ({
            code: row['alpha-2'],
            name: row.name,
            region: row.region,
            subRegion: row['sub-region'],
        }))
        .concat(missingCountries);

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
        lookupByName,
        lookupByCode,
    };
}

export interface CountryLookup {
    list: Country[];
    lookupByCode: Record<string, Country>;
    lookupByName: Record<string, Country>;
}

export interface Country {
    code: string;
    name: string;
    region: string;
    subRegion: string;
}
