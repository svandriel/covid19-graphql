import { mergeTimeSeriesItem } from './merge-time-series-item';
import { TimeSeriesItem } from './types/time-series';

export function mergeTimeSeriesItemArray(a: TimeSeriesItem[], b: TimeSeriesItem[]): TimeSeriesItem[] {
    if (a.length !== b.length) {
        throw new Error(`Cannot merge time series of unequal length: ${a.length} vs ${b.length} items`);
    }

    // I hate loops but this is by far the fastest way
    const result: TimeSeriesItem[] = [];
    for (let i = 0; i < a.length; i++) {
        result.push(mergeTimeSeriesItem(a[i], b[i]));
    }
    return result;
}
