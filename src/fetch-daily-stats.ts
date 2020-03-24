import { Moment } from 'moment';

import { getCountryLookup } from './country-lookup';
import { fetchCsv } from './fetch-csv';
import { ApiDailyStat } from './generated/graphql-backend';
import { parseDailyStatRow } from './parse-daily-stat-row';
import { DAILY_STATS_BASE_URL } from './urls';
import { DATE_FORMAT_DAILY_STAT } from './util/date-formats';
import { FetchError } from 'node-fetch';

export async function fetchDailyStats(date: Moment): Promise<readonly ApiDailyStat[]> {
    const dateStr = date.format(DATE_FORMAT_DAILY_STAT);
    const url = `${DAILY_STATS_BASE_URL}/${dateStr}.csv`;
    const lookup = await getCountryLookup();
    try {
        const result = await fetchCsv(url);
        return result.map(row => parseDailyStatRow(lookup, date, row));
    } catch (err) {
        if (err instanceof FetchError && err.type === 'ENOTFOUND') {
            return [];
        }
        throw err;
    }
}
