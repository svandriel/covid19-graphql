export interface PaginatedList<T> {
    results: T[];
    count: number;
    offset: number;
    totalCount: number;
    hasNext: boolean;
}

export interface PaginationOptions {
    offset: number;
    count: number;
}

export async function paginate<T>(
    { offset, count }: PaginationOptions,
    list: T[] | Promise<T[]>
): Promise<PaginatedList<T>> {
    const actualList = list instanceof Promise ? await list : list;
    const pagedCoinList = actualList.slice(offset, offset + count);
    return {
        count: pagedCoinList.length,
        offset,
        totalCount: actualList.length,
        results: pagedCoinList,
        hasNext: offset + count < actualList.length
    };
}
