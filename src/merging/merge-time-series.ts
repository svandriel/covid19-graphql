import { TimeSeries } from '../types/time-series-item';
import { mergeTimeSeriesItemArray } from './merge-time-series-item-array';

export function mergeTimeSeries(a: TimeSeries, b: TimeSeries): TimeSeries {
    return {
        countryCode: a.countryCode,
        state: a.state,
        items: mergeTimeSeriesItemArray(a.items, b.items),
    };
}
