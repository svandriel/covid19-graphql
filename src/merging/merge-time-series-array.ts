import { allPass, propEq } from 'ramda';

import { TimeSeries } from '../types/time-series-item';
import { mergeTimeSeries } from './merge-time-series';

export function mergeTimeSeriesArray(a: readonly TimeSeries[], b: readonly TimeSeries[]): readonly TimeSeries[] {
    return b.map(bSeries => {
        const aSeries = a.find(allPass([propEq('countryCode', bSeries.countryCode), propEq('state', bSeries.state)]));
        if (aSeries) {
            return mergeTimeSeries(aSeries, bSeries);
        } else {
            return bSeries;
        }
    });
}
