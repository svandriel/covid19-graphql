import { StatsType } from './types/stats-type';

const TIMESERIES_BASE_URL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series`;

const TIMESERIES_CONFIRMED_URL = `${TIMESERIES_BASE_URL}/time_series_covid19_confirmed_global.csv`;
const TIMESERIES_DEATHS_URL = `${TIMESERIES_BASE_URL}/time_series_covid19_deaths_global.csv`;
const TIMESERIES_RECOVERED_URL = `${TIMESERIES_BASE_URL}/time_series_covid19_recovered_global.csv`;

export const DAILY_STATS_BASE_URL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports`;

export const ESRI_CASES_URL =
    'https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/2/query';

export const ESRI_TIMELINE_URL =
    'https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/4/query';

export const statUrls: Record<StatsType, string> = {
    [StatsType.Confirmed]: TIMESERIES_CONFIRMED_URL,
    [StatsType.Deceased]: TIMESERIES_DEATHS_URL,
    [StatsType.Recovered]: TIMESERIES_RECOVERED_URL,
};
