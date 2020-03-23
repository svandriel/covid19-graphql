import chalk from 'chalk';
import moment from 'moment';

import { countries } from './countries';
import { ApiTimeSeries, ApiTimeSeriesItem } from './generated/graphql-backend';
import { StatsType } from './types/stats-type';
import { DATE_FORMAT_CSV } from './util/date-formats';

export function parseCsvRow(type: StatsType, row: Record<string, string>): ApiTimeSeries {
    const countryName = row['Country/Region'];
    const state = row['Province/State'];
    const countryCodeIso2 = countries[countryName];
    if (!countryCodeIso2) {
        console.error(`${chalk.red('ERROR')}: Invalid country name: ${chalk.cyan(countryName)}`);
    }
    return {
        countryCode: countryCodeIso2,
        state,
        items: parseTimeSeriesItems(type, row)
    };
}

export function parseTimeSeriesItems(type: StatsType, row: Record<string, string>): ApiTimeSeriesItem[] {
    return Object.keys(row)
        .filter(rowName => {
            return /^\d+\/\d+\/\d+$/.test(rowName);
        })
        .map(rowName => {
            const date = moment(rowName, DATE_FORMAT_CSV);
            if (date.isValid()) {
                const value = parseInt(row[rowName], 10);
                const x: ApiTimeSeriesItem = {
                    date,
                    confirmed: type === StatsType.Confirmed ? value : 0,
                    recovered: type === StatsType.Recovered ? value : 0,
                    deceased: type === StatsType.Deceased ? value : 0
                };
                return x;
            } else {
                throw new Error(`Cannot parse date: ${rowName}`);
            }
        });
}
