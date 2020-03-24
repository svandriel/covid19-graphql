import { cachifyPromise } from 'cachify-promise';

import { fetchCsv } from './fetch-csv';
import { countryAliases, missingCountries } from './country-aliases';
import chalk from 'chalk';

const DOWNLOAD_URL =
    'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv';

export const getCountryLookup = cachifyPromise(getCountryLookupUncached);

async function getCountryLookupUncached(): Promise<CountryLookup> {
    const response = await fetchCsv(DOWNLOAD_URL);
    const list = response
        .map(row => ({
            code: row['alpha-2'],
            name: row.name,
        }))
        .concat(missingCountries);

    const lookupName = list.reduce((acc, { code, name }) => {
        acc[code] = name;
        return acc;
    }, {} as Record<string, string>);
    const lookupCode = list.reduce((acc, { code, name }) => {
        acc[name] = code;
        return acc;
    }, {} as Record<string, string>);

    // Add aliases to code lookup
    Object.entries(countryAliases).forEach(([wrongName, correctName]) => {
        const correctCode = lookupCode[correctName];
        if (correctCode) {
            lookupCode[wrongName] = correctCode;
        } else {
            console.error(`${chalk.red('ERROR')}: Invalid alias: ${correctName} for '${wrongName}' does not exist`);
        }
    });

    return {
        list,
        lookupCode,
        lookupName,
    };
}

export interface CountryLookup {
    list: Array<{ code: string; name: string }>;
    lookupName: Record<string, string>;
    lookupCode: Record<string, string>;
}
