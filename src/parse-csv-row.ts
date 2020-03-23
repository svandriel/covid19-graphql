import chalk from 'chalk';
import moment from 'moment';

import { countries } from './countries';
import { StatsType } from './types/stats-type';
import { TimeSeries, TimeSeriesItem } from './types/time-series';
import { DATE_FORMAT_CSV, DATE_FORMAT_REVERSE } from './util/date-formats';

export function parseCsvRow(type: StatsType, row: Record<string, string>): TimeSeries {
    const countryName = row['Country/Region'];
    const state = row['Province/State'];
    const countryCodeIso2 = countries[countryName];
    if (!countryCodeIso2) {
        console.error(`${chalk.red('ERROR')}: Invalid country name: ${chalk.cyan(countryName)}`);
    }
    return {
        provinceState: state,
        countryRegion: countryName,
        countryCodeIso2,
        lat: parseFloat(row.Lat),
        long: parseFloat(row.Long),
        items: parseTimeSeriesItems(type, row)
    };
}

export function parseTimeSeriesItems(type: StatsType, row: Record<string, string>): TimeSeriesItem[] {
    return Object.keys(row)
        .filter(rowName => {
            return /^\d+\/\d+\/\d+$/.test(rowName);
        })
        .map(rowName => {
            const date = moment(rowName, DATE_FORMAT_CSV);
            if (date.isValid()) {
                return {
                    date: date.format(DATE_FORMAT_REVERSE),
                    value: {
                        [StatsType.Confirmed]: 0,
                        [StatsType.Deceased]: 0,
                        [StatsType.Recovered]: 0,
                        [type]: parseInt(row[rowName], 10)
                    }
                };
            } else {
                throw new Error(`Cannot parse date: ${rowName}`);
            }
        });
}
