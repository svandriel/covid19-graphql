import { ApiTimeSeriesItem } from '../generated/graphql-backend';
import { mergeTimeSeriesItem } from './merge-time-series-item';

export function mergeTimeSeriesItemArray(
    a: readonly ApiTimeSeriesItem[],
    b: readonly ApiTimeSeriesItem[],
): ApiTimeSeriesItem[] {
    if (a.length !== b.length) {
        throw new Error(`Cannot merge time series of unequal length: ${a.length} vs ${b.length} items`);
    }

    // I hate loops but this is by far the fastest way
    const result: ApiTimeSeriesItem[] = [];
    for (let i = 0; i < a.length; i++) {
        result.push(mergeTimeSeriesItem(a[i], b[i]));
    }
    return result;
}
