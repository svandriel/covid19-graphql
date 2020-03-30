import { Moment } from 'moment';

export interface CountryStat {
    readonly countryCode: string;
    readonly lastUpdated: Moment;
    readonly confirmed: number;
    readonly deceased: number;
    readonly recovered: number;
}
