import moment from 'moment';

import { ApiTimeSeriesItem } from './generated/graphql-backend';
import { StatsType } from './types/stats-type';
import { TimeSeriesItem } from './types/time-series';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

export function convertTimeSeriesItem(item: TimeSeriesItem): ApiTimeSeriesItem {
    const date = moment(item.date, DATE_FORMAT_REVERSE, true);
    if (!date.isValid()) {
        throw new Error(`Invalid date: ${item.date}`);
    }
    return {
        confirmed: item.value[StatsType.Confirmed],
        deceased: item.value[StatsType.Deceased],
        recovered: item.value[StatsType.Recovered],
        date
    };
}
