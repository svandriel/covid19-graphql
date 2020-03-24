import { ApiTimeSeriesItem } from '../generated/graphql-backend';

export function mergeTimeSeriesItem(itemA: ApiTimeSeriesItem, itemB: ApiTimeSeriesItem): ApiTimeSeriesItem {
    if (!itemA.date.isSame(itemB.date)) {
        throw new Error(`Cannot merge time series items with a different date: ${itemA.date} vs ${itemB.date}`);
    }
    return {
        date: itemA.date,
        confirmed: itemA.confirmed + itemB.confirmed,
        deceased: itemA.deceased + itemB.deceased,
        recovered: itemA.recovered + itemB.recovered,
    };
}
