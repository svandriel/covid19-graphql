import { allPass, propEq } from 'ramda';

import { mergeTimeSeries } from './merge-time-series';
import { TimeSeries } from './types/time-series';

export function mergeTimeSeriesArray(a: TimeSeries[], b: TimeSeries[]): TimeSeries[] {
    return b.map(bSeries => {
        const aSeries = a.find(
            allPass([propEq('countryRegion', bSeries.countryRegion), propEq('provinceState', bSeries.provinceState)])
        );
        if (aSeries) {
            return mergeTimeSeries(aSeries, bSeries);
        } else {
            return bSeries;
        }
    });
}
