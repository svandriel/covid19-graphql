import { makeStringLookup } from './make-string-lookup';

/**
 * Optimized and curried 'includes' function for strings
 */
export function includesString(list: readonly string[]): (item: string) => boolean {
    const lookup = makeStringLookup(list);
    return (item: string) => !!lookup[item];
}
