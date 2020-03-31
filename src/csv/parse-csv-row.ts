import moment from 'moment';

import { Country } from '../country-lookup';
import { ApiTimelineItem } from '../generated/graphql-backend';
import { StatsType } from '../types/stats-type';
import { Timeline } from '../types/timeline';
import { DATE_FORMAT_CSV } from '../util/date-formats';

export function parseCsvRow(
    lookupByName: Record<string, Country>,
    type: StatsType,
    row: Record<string, string>,
): Timeline {
    const countryName = row['Country/Region'];
    const state = row['Province/State'];
    const country = lookupByName[countryName];
    if (!country) {
        throw new Error(`Country not found: ${countryName}`);
    }
    return {
        countryCode: country?.code || 'NO CODE',
        state,
        items: parseTimeSeriesItems(type, row),
    };
}

export const invalidCountries = new Set<string>();

export function parseTimeSeriesItems(type: StatsType, row: Record<string, string>): ApiTimelineItem[] {
    const dateRowNames = Object.keys(row).filter(rowName => {
        return /^\d+\/\d+\/\d+$/.test(rowName);
    });
    return dateRowNames.reduce((acc, rowName) => {
        const last: ApiTimelineItem | undefined = acc[acc.length - 1];
        const date = moment(rowName, DATE_FORMAT_CSV);
        if (date.isValid()) {
            const valueStr = row[rowName];
            const value = valueStr === '' ? 0 : parseInt(valueStr, 10);
            if (isNaN(value)) {
                const countryName = row['Country/Region'];
                const state = row['Province/State'];
                throw new Error(`Cannot parse '${valueStr}' into number for ${countryName}/${state} (type: ${type})`);
            }
            const confirmed = type === StatsType.Confirmed ? value : 0;
            const recovered = type === StatsType.Recovered ? value : 0;
            const deceased = type === StatsType.Deceased ? value : 0;
            acc.push({
                date,
                confirmed,
                recovered,
                deceased,
                ...(last && {
                    deltaConfirmed: confirmed - last.confirmed,
                    deltaRecovered: recovered - last.recovered,
                    deltaDeceased: deceased - last.deceased,
                }),
            });
        } else {
            throw new Error(`Cannot parse date: ${rowName}`);
        }
        return acc;
    }, [] as ApiTimelineItem[]);
}
