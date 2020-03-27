import { allPass, propEq } from 'ramda';

import { TimeSeries } from '../types/time-series-item';
import { mergeTimeSeries } from './merge-time-series';

export function mergeTimeSeriesArray(a: readonly TimeSeries[], b: readonly TimeSeries[]): readonly TimeSeries[] {
    // Find all in series A *not* found in series B
    const onlyInA = a.filter(aSeries => {
        const bSeries = b.find(allPass([propEq('countryCode', aSeries.countryCode), propEq('state', aSeries.state)]));
        return !bSeries;
    });

    // Find all timeseries in B and either merge with corresponding series in A or return it as is
    const result2 = b.map(bSeries => {
        const aSeries = a.find(allPass([propEq('countryCode', bSeries.countryCode), propEq('state', bSeries.state)]));
        if (aSeries) {
            return mergeTimeSeries(aSeries, bSeries);
        } else {
            return bSeries;
        }
    });
    return onlyInA.concat(result2);
}
