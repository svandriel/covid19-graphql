import { ApiTimelineItem } from '../generated/graphql-backend';
import { mergeTimelineItem } from './merge-timeline-item';

export function mergeTimelineItemArray(
    a: readonly ApiTimelineItem[],
    b: readonly ApiTimelineItem[],
): ApiTimelineItem[] {
    const length = Math.max(a.length, b.length);

    // I hate loops but this is by far the fastest way
    const result: ApiTimelineItem[] = [];
    let lastA: ApiTimelineItem | undefined;
    let lastB: ApiTimelineItem | undefined;

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

        const merged = aItem && bItem ? mergeTimelineItem(aItem, bItem) : aItem || bItem;
        result.push(merged);

        lastA = aItem;
        lastB = bItem;
    }
    return result;
}
