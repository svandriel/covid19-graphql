import { ApiTimelineItem } from '../generated/graphql-backend';
import { DATE_FORMAT_REVERSE } from '../util/date-formats';

export function mergeTimelineItem(itemA: ApiTimelineItem, itemB: ApiTimelineItem): ApiTimelineItem {
    if (!itemA.date.isSame(itemB.date)) {
        const formatDateA = itemA.date.format(DATE_FORMAT_REVERSE);
        const formatDateB = itemB.date.format(DATE_FORMAT_REVERSE);
        throw new Error(`Cannot merge timeline items with a different date: ${formatDateA} vs ${formatDateB}`);
    }
    return {
        date: itemA.date,
        confirmed: itemA.confirmed + itemB.confirmed,
        deceased: itemA.deceased + itemB.deceased,
        recovered: itemA.recovered + itemB.recovered,
    };
}
