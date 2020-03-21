import { StatsType } from './stats-type';

export interface TimeSeries<T> {
    key: string;
    provinceState: string;
    countryRegion: string;
    countryCodeIso2?: string;
    lat: number;
    long: number;
    items: Array<TimeSeriesItem<T>>;
}

export interface TimeSeriesItem<T> {
    date: string;
    value: T;
}

export interface DailyStat extends Record<StatsType, number> {}

export interface TimeSeriesPerState<T> extends Record<string, TimeSeries<T>> {}
export interface TimeSeriesPerCountry<T> extends Record<string, TimeSeries<T>> {}
export interface TimeSeriesPerCountryAndState<T> extends Record<string, TimeSeriesPerState<T>> {}
