import { ApiTimeSeriesItem } from '../generated/graphql-backend';
import { mergeTimeSeriesItem } from './merge-time-series-item';

export function mergeTimeSeriesItemArray(
    a: readonly ApiTimeSeriesItem[],
    b: readonly ApiTimeSeriesItem[],
): ApiTimeSeriesItem[] {
    const length = Math.max(a.length, b.length);

    // I hate loops but this is by far the fastest way
    const result: ApiTimeSeriesItem[] = [];
    let lastA: ApiTimeSeriesItem | undefined;
    let lastB: ApiTimeSeriesItem | undefined;

    for (let i = 0; i < length; i++) {
        const aItem =
            !a[i] && lastA
                ? {
                      ...lastA,
                      date: b[i].date,
                  }
                : a[i];
        const bItem =
            !b[i] && lastB
                ? {
                      ...lastB,
                      date: a[i].date,
                  }
                : b[i];

        const merged = aItem && bItem ? mergeTimeSeriesItem(aItem, bItem) : aItem || bItem;
        result.push(merged);

        lastA = aItem;
        lastB = bItem;
    }
    return result;
}
