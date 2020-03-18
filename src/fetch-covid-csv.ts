import { pluck, propEq, uniq } from 'ramda';

import { countries } from './countries';
import { fetchCsv } from './fetch-csv';
import { parseCsvRow } from './parse-csv-row';
import { StatsType } from './types/stats-type';
import { DailyStat, TimeSeries, TimeSeriesPerCountryAndState } from './types/time-series';
import { statsTypes, statUrls } from './urls';

export async function fetchCovidCsv(statsType: StatsType): Promise<TimeSeriesPerCountryAndState> {
    const rows = await fetchCsv(statUrls[statsType]);
    const mappedRows = rows.map(parseCsvRow);
    return mappedRows.reduce((acc, item) => {
        const countryCodeIso2 = item.countryCodeIso2 || 'none';
        acc[countryCodeIso2] = acc[countryCodeIso2] || {};
        acc[countryCodeIso2][item.provinceState || 'all'] = item;
        return acc;
    }, {} as TimeSeriesPerCountryAndState);
}

export async function fetchAll(): Promise<Array<TimeSeries<DailyStat>>> {
    const results = await Promise.all(
        statsTypes.map(async type => {
            const result = await fetchCovidCsv(type);
            return {
                type,
                result
            };
        })
    );
    const resultMap = results.reduce((acc, item) => {
        acc[item.type] = item.result;
        return acc;
    }, {} as Record<StatsType, TimeSeriesPerCountryAndState>);

    return Object.values(countries).flatMap(countryIso2 => {
        const confirmed = resultMap[StatsType.Confirmed][countryIso2] || {};
        const deceased = resultMap[StatsType.Deceased][countryIso2] || {};
        const recovered = resultMap[StatsType.Recovered][countryIso2] || {};

        const states = uniq(
            Object.keys(confirmed)
                .concat(Object.keys(deceased))
                .concat(Object.keys(recovered))
        );
        return states.map(state => {
            const stateConfirmed = confirmed[state];
            const stateDeceased = deceased[state];
            const stateRecovered = recovered[state];
            const dates = [
                ...pluck('date', stateConfirmed.items),
                ...pluck('date', stateDeceased.items),
                ...pluck('date', stateRecovered.items)
            ];
            const uniqueDates = uniq(dates);

            const series: TimeSeries<DailyStat> = {
                countryRegion: stateConfirmed.countryRegion,
                provinceState: stateConfirmed.provinceState,
                key: stateConfirmed.key,
                lat: stateConfirmed.lat,
                long: stateConfirmed.long,
                countryCodeIso2: stateConfirmed.countryCodeIso2,
                items: uniqueDates.map(date => ({
                    date,
                    value: {
                        [StatsType.Confirmed]: stateConfirmed.items.find(propEq('date', date))?.value || 0,
                        [StatsType.Deceased]: stateDeceased.items.find(propEq('date', date))?.value || 0,
                        [StatsType.Recovered]: stateRecovered.items.find(propEq('date', date))?.value || 0
                    }
                }))
            };
            return series;
        });
    });
}
