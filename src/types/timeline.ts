import { ApiTimelineItem } from '../generated/graphql-backend';

export interface Timeline {
    readonly countryCode: string;
    readonly state: string;
    items: readonly ApiTimelineItem[];
}
