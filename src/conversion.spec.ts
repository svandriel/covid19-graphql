import { convertTimeSeriesItem } from './conversion';
import { StatsType } from './types/stats-type';
import { ApiTimeSeriesItem } from './generated/graphql-backend';
import moment from 'moment';
import { DATE_FORMAT_REVERSE } from './util/date-formats';

describe('conversion', () => {
    it('works', () => {
        expect(
            convertTimeSeriesItem({
                date: '2020-03-12',
                value: {
                    [StatsType.Confirmed]: 12,
                    [StatsType.Deceased]: 1,
                    [StatsType.Recovered]: 5
                }
            })
        ).toEqual({
            date: moment('2020-03-12', DATE_FORMAT_REVERSE, true),
            confirmed: 12,
            deceased: 1,
            recovered: 5
        } as ApiTimeSeriesItem);
    });
    it('fails when date is invalid', () => {
        expect(() =>
            convertTimeSeriesItem({
                date: '2020-03-12x',
                value: {
                    [StatsType.Confirmed]: 12,
                    [StatsType.Deceased]: 1,
                    [StatsType.Recovered]: 5
                }
            })
        ).toThrowError('Invalid date: 2020-03-12x');
    });
});
