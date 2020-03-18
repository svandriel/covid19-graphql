import { TimeSeries, TimeSeriesItem } from './types/time-series';
import moment from 'moment';
import { countries } from './countries';

export function parseCsvRow(row: Record<string, string>): TimeSeries<number> {
    const countryName = row['Country/Region'];
    const state = row['Province/State'];
    const countryCodeIso2 = countries[countryName];
    if (!countryCodeIso2) {
        console.error(`Invalid country name: ${countryName}`);
    }
    const key = `${countryCodeIso2 || 'unknown'}|${state || 'all'}`;
    return {
        key,
        provinceState: row['Province/State'],
        countryRegion: countryName,
        countryCodeIso2,
        lat: parseFloat(row.Lat),
        long: parseFloat(row.Long),
        items: parseTimeSeriesItems(row)
    };
}

export function parseTimeSeriesItems(row: Record<string, string>): Array<TimeSeriesItem<number>> {
    return Object.keys(row)
        .filter(rowName => {
            return /^\d+\/\d+\/\d+$/.test(rowName);
        })
        .map(rowName => {
            const date = moment(rowName, 'MM/DD/y');
            if (date.isValid()) {
                const dateStr = date.format('Y-MM-DD');
                return {
                    date: dateStr,
                    value: parseInt(row[rowName], 10)
                };
            } else {
                throw new Error(`Cannot parse date: ${rowName}`);
            }
        });
}
