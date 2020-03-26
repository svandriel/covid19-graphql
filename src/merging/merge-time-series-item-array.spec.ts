import moment from 'moment';

import { DATE_FORMAT_REVERSE } from '../util/date-formats';
import { mergeTimeSeriesItemArray } from './merge-time-series-item-array';

describe('merge time series item array', () => {
    it('merges arrays of same length', () => {
        expect(
            mergeTimeSeriesItemArray(
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 100,
                        deceased: 10,
                        recovered: 80,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 110,
                        deceased: 11,
                        recovered: 82,
                    },
                ],
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 30,
                        deceased: 3,
                        recovered: 4,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 32,
                        deceased: 4,
                        recovered: 6,
                    },
                ],
            ),
        ).toEqual([
            {
                confirmed: 130,
                date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                deceased: 13,
                recovered: 84,
            },
            {
                confirmed: 142,
                date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                deceased: 15,
                recovered: 88,
            },
        ]);
    });

    it('merges arrays of unequal length (first is longer)', () => {
        expect(
            mergeTimeSeriesItemArray(
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 100,
                        deceased: 0,
                        recovered: 0,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 110,
                        deceased: 0,
                        recovered: 0,
                    },
                ],
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 0,
                        deceased: 0,
                        recovered: 4,
                    },
                ],
            ),
        ).toEqual([
            {
                confirmed: 100,
                date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                deceased: 0,
                recovered: 4,
            },
            {
                confirmed: 110,
                date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                deceased: 0,
                recovered: 4,
            },
        ]);
    });

    it('merges arrays of unequal length (second is longer)', () => {
        expect(
            mergeTimeSeriesItemArray(
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 100,
                        deceased: 0,
                        recovered: 0,
                    },
                ],
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 0,
                        deceased: 0,
                        recovered: 4,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 0,
                        deceased: 0,
                        recovered: 7,
                    },
                ],
            ),
        ).toEqual([
            {
                confirmed: 100,
                date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                deceased: 0,
                recovered: 4,
            },
            {
                confirmed: 100,
                date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                deceased: 0,
                recovered: 7,
            },
        ]);
    });
});
