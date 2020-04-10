import { ascend, compose, descend, prop, sortWith } from 'ramda';

import { DataSource } from '../../data-source';
import { ApiCountry, ApiCountrySort, ApiSortOrder } from '../../generated/graphql-backend';
import { normalizeString } from '../../util/normalize-string';

export interface CountrySortOptions {
    sortBy: ApiCountrySort;
    sortOrder: ApiSortOrder;
}

export async function countrySort(
    dataSource: DataSource,
    options: CountrySortOptions,
    countries: readonly ApiCountry[],
): Promise<ApiCountry[]> {
    const { sortBy, sortOrder } = options;

    const propGet = await getComparisonProp(dataSource, sortBy);
    const createComparator = sortOrder === ApiSortOrder.Ascending ? ascend : descend;

    return sortWith([createComparator(propGet)], countries);
}

async function getComparisonProp(
    dataSource: DataSource,
    sortBy: ApiCountrySort,
): Promise<(country: ApiCountry) => any> {
    switch (sortBy) {
        case ApiCountrySort.Code:
            return prop('code');
        case ApiCountrySort.Name:
            return compose(normalizeString, prop('name'));
        case ApiCountrySort.Confirmed: {
            const currentLookup = await dataSource.getCurrentAsLookup();
            return country => currentLookup[country.code]?.confirmed ?? 0;
        }
        case ApiCountrySort.Deceased: {
            const currentLookup = await dataSource.getCurrentAsLookup();
            return country => currentLookup[country.code]?.deceased ?? 0;
        }
        case ApiCountrySort.Recovered: {
            const currentLookup = await dataSource.getCurrentAsLookup();
            return country => currentLookup[country.code]?.recovered ?? 0;
        }
        default:
            throw new Error(`Unsupported sortBy: ${sortBy}`);
    }
}
