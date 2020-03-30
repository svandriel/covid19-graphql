import moment from 'moment';

import { ApiTimelineItem } from '../generated/graphql-backend';

export function today(): ApiTimelineItem {
    const date = moment().startOf('day');
    return {
        confirmed: 0,
        deceased: 0,
        recovered: 0,
        date,
    };
}
