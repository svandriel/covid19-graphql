import moment from 'moment';

import { ApiTimeSeries, ApiTimeSeriesItem } from './generated/graphql-backend';
import { StatsType } from './types/stats-type';
import { DATE_FORMAT_CSV } from './util/date-formats';

export function parseCsvRow(
    codeLookup: Record<string, string>,
    type: StatsType,
    row: Record<string, string>,
): ApiTimeSeries {
    const countryName = row['Country/Region'];
    const state = row['Province/State'];
    const countryCodeIso2 = codeLookup[countryName];
    if (!countryCodeIso2) {
        invalidCountries.add(countryName);
    }
    return {
        countryCode: countryCodeIso2,
        state,
        items: parseTimeSeriesItems(type, row),
    };
}

export const invalidCountries = new Set<string>();

export function parseTimeSeriesItems(type: StatsType, row: Record<string, string>): ApiTimeSeriesItem[] {
    return Object.keys(row)
        .filter(rowName => {
            return /^\d+\/\d+\/\d+$/.test(rowName);
        })
        .map(rowName => {
            const date = moment(rowName, DATE_FORMAT_CSV);
            if (date.isValid()) {
                const valueStr = row[rowName];
                const value = valueStr === '' ? 0 : parseInt(valueStr, 10);
                if (isNaN(value)) {
                    const countryName = row['Country/Region'];
                    const state = row['Province/State'];
                    throw new Error(
                        `Cannot parse '${valueStr}' into number for ${countryName}/${state} (type: ${type})`,
                    );
                }
                const x: ApiTimeSeriesItem = {
                    date,
                    confirmed: type === StatsType.Confirmed ? value : 0,
                    recovered: type === StatsType.Recovered ? value : 0,
                    deceased: type === StatsType.Deceased ? value : 0,
                };
                return x;
            } else {
                throw new Error(`Cannot parse date: ${rowName}`);
            }
        });
}
