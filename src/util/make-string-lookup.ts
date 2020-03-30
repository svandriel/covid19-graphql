export function makeStringLookup(list: readonly string[]): Record<string, boolean | undefined> {
    return list.reduce((acc, item) => {
        acc[item] = true;
        return acc;
    }, {} as Record<string, boolean | undefined>);
}
