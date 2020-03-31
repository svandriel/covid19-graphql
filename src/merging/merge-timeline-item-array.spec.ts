import moment from 'moment';

import { DATE_FORMAT_REVERSE } from '../util/date-formats';
import { mergeTimelineItemArray } from './merge-timeline-item-array';

describe('merge time series item array', () => {
    it('merges arrays of same length', () => {
        expect(
            mergeTimelineItemArray(
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 100,
                        deceased: 10,
                        recovered: 80,
                        deltaConfirmed: 2,
                        deltaDeceased: 3,
                        deltaRecovered: 4,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 110,
                        deceased: 11,
                        recovered: 82,
                        deltaConfirmed: 10,
                        deltaDeceased: 1,
                        deltaRecovered: 2,
                    },
                ],
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 30,
                        deceased: 3,
                        recovered: 4,
                        deltaConfirmed: 3,
                        deltaDeceased: 4,
                        deltaRecovered: 5,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 32,
                        deceased: 4,
                        recovered: 6,
                        deltaConfirmed: 2,
                        deltaDeceased: 1,
                        deltaRecovered: 2,
                    },
                ],
            ),
        ).toEqual([
            {
                confirmed: 130,
                date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                deceased: 13,
                recovered: 84,
                deltaConfirmed: 5,
                deltaDeceased: 7,
                deltaRecovered: 9,
            },
            {
                confirmed: 142,
                date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                deceased: 15,
                recovered: 88,
                deltaConfirmed: 12,
                deltaDeceased: 2,
                deltaRecovered: 4,
            },
        ]);
    });

    it('merges arrays of unequal length (first is longer)', () => {
        expect(
            mergeTimelineItemArray(
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 100,
                        deceased: 0,
                        recovered: 0,
                        deltaConfirmed: 2,
                        deltaDeceased: 3,
                        deltaRecovered: 4,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 110,
                        deceased: 2,
                        recovered: 3,
                        deltaConfirmed: 10,
                        deltaDeceased: 2,
                        deltaRecovered: 3,
                    },
                ],
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 0,
                        deceased: 0,
                        recovered: 4,
                        deltaConfirmed: 3,
                        deltaDeceased: 4,
                        deltaRecovered: 5,
                    },
                ],
            ),
        ).toEqual([
            {
                confirmed: 100,
                date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                deceased: 0,
                recovered: 4,
                deltaConfirmed: 5,
                deltaDeceased: 7,
                deltaRecovered: 9,
            },
            {
                confirmed: 110,
                date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                deceased: 2,
                recovered: 7,
                deltaConfirmed: 10,
                deltaDeceased: 2,
                deltaRecovered: 3,
            },
        ]);
    });

    it('merges arrays of unequal length (second is longer)', () => {
        expect(
            mergeTimelineItemArray(
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 100,
                        deceased: 0,
                        recovered: 0,
                        deltaConfirmed: 2,
                        deltaDeceased: 3,
                        deltaRecovered: 4,
                    },
                ],
                [
                    {
                        date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                        confirmed: 0,
                        deceased: 0,
                        recovered: 4,
                        deltaConfirmed: 0,
                        deltaDeceased: 0,
                        deltaRecovered: 4,
                    },
                    {
                        date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                        confirmed: 1,
                        deceased: 1,
                        recovered: 7,
                        deltaConfirmed: 1,
                        deltaDeceased: 1,
                        deltaRecovered: 3,
                    },
                ],
            ),
        ).toEqual([
            {
                confirmed: 100,
                date: moment('2020-03-01', DATE_FORMAT_REVERSE),
                deceased: 0,
                recovered: 4,
                deltaConfirmed: 2,
                deltaDeceased: 3,
                deltaRecovered: 8,
            },
            {
                confirmed: 101,
                date: moment('2020-03-02', DATE_FORMAT_REVERSE),
                deceased: 1,
                recovered: 7,
                deltaConfirmed: 1,
                deltaDeceased: 1,
                deltaRecovered: 3,
            },
        ]);
    });
});
