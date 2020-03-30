import { Timeline } from '../types/timeline';
import { mergeTimelineItemArray } from './merge-timeline-item-array';

export function mergeTimeSeries(a: Timeline, b: Timeline): Timeline {
    return {
        countryCode: a.countryCode,
        state: a.state,
        items: mergeTimelineItemArray(a.items, b.items),
    };
}
