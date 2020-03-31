import { ApiLatest } from '../generated/graphql-backend';

export function today(): ApiLatest {
    return {
        confirmed: 0,
        deceased: 0,
        recovered: 0,
    };
}
