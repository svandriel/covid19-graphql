import { pluck, propEq, uniq } from 'ramda';

import { StatsType } from './types/stats-type';
import { DailyStat, TimeSeriesPerCountryAndState, TimeSeriesPerState } from './types/time-series';

export function mergeStats(
    resultMap: Record<StatsType, TimeSeriesPerCountryAndState<number>>
): TimeSeriesPerCountryAndState<DailyStat> {
    const countries = uniq(Object.values(resultMap).flatMap(result => Object.keys(result)));
    return countries.reduce((acc, countryIso2) => {
        const confirmed = resultMap[StatsType.Confirmed][countryIso2] || {};
        const deceased = resultMap[StatsType.Deceased][countryIso2] || {};
        const recovered = resultMap[StatsType.Recovered][countryIso2] || {};

        const states = uniq(
            Object.keys(confirmed)
                .concat(Object.keys(deceased))
                .concat(Object.keys(recovered))
        );
        acc[countryIso2] = states.reduce((acc2, state) => {
            const stateConfirmed = confirmed[state];
            const stateDeceased = deceased[state];
            const stateRecovered = recovered[state];

            const dates = [
                ...pluck('date', stateConfirmed.items),
                ...pluck('date', stateDeceased.items),
                ...pluck('date', stateRecovered.items)
            ];
            const uniqueDates = uniq(dates);

            acc2[state] = {
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
            return acc2;
        }, {} as TimeSeriesPerState<DailyStat>);
        return acc;
    }, {} as TimeSeriesPerCountryAndState<DailyStat>);
}
