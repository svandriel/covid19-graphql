import { Moment } from 'moment';

import { ApiTimeSeriesItem } from '../generated/graphql-backend';

export interface TimeSeries {
    readonly countryCode: string;
    readonly state: string;
    items: readonly ApiTimeSeriesItem[];
}

export interface CountryStat {
    readonly countryCode: string;
    readonly lastUpdated: Moment;
    readonly confirmed: number;
    readonly deceased: number;
    readonly recovered: number;
}
