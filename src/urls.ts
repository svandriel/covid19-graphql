import { StatsType } from './types/stats-type';

const BASE_URL = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series`;

const CONFIRMED_URL = `${BASE_URL}/time_series_19-covid-Confirmed.csv`;
const DEATHS_URL = `${BASE_URL}/time_series_19-covid-Deaths.csv`;
const RECOVERED_URL = `${BASE_URL}/time_series_19-covid-Recovered.csv`;

export const statsTypes: StatsType[] = [StatsType.Confirmed, StatsType.Deceased, StatsType.Recovered];

export const statUrls: Record<StatsType, string> = {
    [StatsType.Confirmed]: CONFIRMED_URL,
    [StatsType.Deceased]: DEATHS_URL,
    [StatsType.Recovered]: RECOVERED_URL
};
