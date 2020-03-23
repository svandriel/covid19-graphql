import { mergeTimeSeriesItemArray } from './merge-time-series-item-array';
import { TimeSeries } from './types/time-series';

export function mergeTimeSeries(a: TimeSeries, b: TimeSeries): TimeSeries {
    return {
        countryRegion: a.countryRegion,
        provinceState: a.provinceState,
        countryCodeIso2: a.countryCodeIso2,
        lat: a.lat,
        long: a.long,
        items: mergeTimeSeriesItemArray(a.items, b.items)
    };
}
