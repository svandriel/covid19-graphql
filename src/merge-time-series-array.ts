import { allPass, propEq } from 'ramda';

import { ApiTimeSeries } from './generated/graphql-backend';
import { mergeTimeSeries } from './merge-time-series';

export function mergeTimeSeriesArray(a: ApiTimeSeries[], b: ApiTimeSeries[]): ApiTimeSeries[] {
    return b.map(bSeries => {
        const aSeries = a.find(allPass([propEq('countryCode', bSeries.countryCode), propEq('state', bSeries.state)]));
        if (aSeries) {
            return mergeTimeSeries(aSeries, bSeries);
        } else {
            return bSeries;
        }
    });
}
