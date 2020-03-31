import moment from 'moment';

import { ApiTimelineItem } from '../generated/graphql-backend';
import { DATE_FORMAT_REVERSE } from '../util/date-formats';
import { mergeTimelineItem } from './merge-timeline-item';

describe('merge timeline item', () => {
    it('works', () => {
        expect(
            mergeTimelineItem(
                createTimelineItem('2020-01-03', [100, 1, 10], [2, 3, 4]),
                createTimelineItem('2020-01-03', [30, 1, 3], [3, 4, 5]),
            ),
        ).toEqual(createTimelineItem('2020-01-03', [130, 2, 13], [5, 7, 9]));
    });
    it('handles undefined values', () => {
        expect(
            mergeTimelineItem(
                createTimelineItem('2020-01-03', [100, 1, 10], [2, 3, undefined]),
                createTimelineItem('2020-01-03', [30, 1, 3], [3, undefined, 5]),
            ),
        ).toEqual(createTimelineItem('2020-01-03', [130, 2, 13], [5, undefined, undefined]));
    });
    it('fails when the dates mismatch', () => {
        expect(() =>
            mergeTimelineItem(
                createTimelineItem('2020-01-03', [100, 1, 10], [2, 3, 4]),
                createTimelineItem('2020-01-05', [30, 1, 3], [3, 4, 5]),
            ),
        ).toThrowError('Cannot merge timeline items with a different date: 2020-01-03 vs 2020-01-05');
    });
});

function createTimelineItem(
    date: string,
    data: [number, number, number],
    diff: [number | undefined, number | undefined, number | undefined],
): ApiTimelineItem {
    return {
        date: moment(date, DATE_FORMAT_REVERSE),
        confirmed: data[0],
        deceased: data[1],
        recovered: data[2],
        deltaConfirmed: diff[0],
        deltaDeceased: diff[1],
        deltaRecovered: diff[2],
    };
}
