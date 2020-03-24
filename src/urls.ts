import { StatsType } from './types/stats-type';

const TIMESERIES_BASE_URL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series`;

const TIMESERIES_CONFIRMED_URL = `${TIMESERIES_BASE_URL}/time_series_19-covid-Confirmed.csv`;
const TIMESERIES_DEATHS_URL = `${TIMESERIES_BASE_URL}/time_series_19-covid-Deaths.csv`;
const TIMESERIES_RECOVERED_URL = `${TIMESERIES_BASE_URL}/time_series_19-covid-Recovered.csv`;

export const DAILY_STATS_BASE_URL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports`;

export const statUrls: Record<StatsType, string> = {
    [StatsType.Confirmed]: TIMESERIES_CONFIRMED_URL,
    [StatsType.Deceased]: TIMESERIES_DEATHS_URL,
    [StatsType.Recovered]: TIMESERIES_RECOVERED_URL,
};
