import { isNil, reject } from 'ramda';

export function compact<T>(list: Array<T | undefined | null>): T[] {
    return reject(isNil, list) as T[];
}
