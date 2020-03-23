import { mergeDailyState } from './merge-daily-stat';
import { TimeSeriesItem } from './types/time-series';

export function mergeTimeSeriesItem(itemA: TimeSeriesItem, itemB: TimeSeriesItem): TimeSeriesItem {
    if (itemA.date !== itemB.date) {
        throw new Error(`Cannot merge time series items with a different date: ${itemA.date} vs ${itemB.date}`);
    }
    return {
        date: itemA.date,
        value: mergeDailyState(itemA.value, itemB.value)
    };
}
