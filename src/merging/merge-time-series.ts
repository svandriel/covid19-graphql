import { ApiTimeSeries } from '../generated/graphql-backend';
import { mergeTimeSeriesItemArray } from './merge-time-series-item-array';

export function mergeTimeSeries(a: ApiTimeSeries, b: ApiTimeSeries): ApiTimeSeries {
    return {
        countryCode: a.countryCode,
        state: a.state,
        items: mergeTimeSeriesItemArray(a.items, b.items),
    };
}
