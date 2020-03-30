import { Moment } from 'moment';

export interface TimeRange {
    from?: Moment | null;
    to?: Moment | null;
}
