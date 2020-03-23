import { StatsType } from './stats-type';

export interface TimeSeries {
    provinceState: string;
    countryRegion: string;
    countryCodeIso2: string;
    lat: number;
    long: number;
    items: TimeSeriesItem[];
}

export interface TimeSeriesItem {
    date: string;
    value: DailyStat;
}

export interface DailyStat extends Record<StatsType, number> {}
