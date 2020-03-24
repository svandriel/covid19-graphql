import chalk from 'chalk';
import { Moment } from 'moment';
import { isNil } from 'ramda';

import { CountryLookup } from './country-lookup';
import { ApiCountry, ApiDailyStat } from './generated/graphql-backend';

export function parseDailyStatRow(codeLookup: CountryLookup, date: Moment, row: Record<string, string>): ApiDailyStat {
    const state = isNil(row.Province_State) ? row['Province/State'] : row.Province_State;
    const countryName = isNil(row.Country_Region) ? row['Country/Region'] : row.Country_Region;
    const lastUpdated = isNil(row.Last_Update) ? row['Last Update'] : row.Last_Update;
    const confirmed = parseNumber(row, 'Confirmed');
    const deceased = parseNumber(row, 'Deaths');
    const recovered = parseNumber(row, 'Recovered');
    if (isNil(state)) {
        throw new Error(`Missing state: ${JSON.stringify(row)}`);
    }
    if (isNil(countryName)) {
        throw new Error(`Missing country name: ${JSON.stringify(row)}`);
    }
    if (isNil(lastUpdated)) {
        throw new Error(`Missing lastUpdated: ${JSON.stringify(row)}`);
    }

    const countryCodeIso2 = codeLookup.lookupCode[countryName];
    if (!countryCodeIso2) {
        console.error(`${chalk.red('ERROR')}: invalid country name: ${countryName}`);
        throw new Error(`invalid country name: ${countryName}`);
    }

    const parsed = {
        countryCode: countryCodeIso2 || countryName || 'no country name',
        state,
        date,
        lastUpdated,
        confirmed,
        deceased,
        recovered,
        country: (undefined as any) as ApiCountry,
    };
    // console.log('--->', parsed);

    return parsed;
}

function parseNumber(row: Record<string, string>, key: string): number {
    const valueStr = row[key];
    const value = valueStr === '' ? 0 : parseInt(valueStr, 10);
    if (isNaN(value)) {
        const countryName = row['Country/Region'];
        const state = row['Province/State'];
        throw new Error(`Cannot parse '${valueStr}' into number for ${countryName}/${state}`);
    }
    return value;
}
