import { pluck, uniq } from 'ramda';

import { CountryLookup } from '../country-lookup';
import { Timeline } from '../types/timeline';
import { includesString } from '../util/includes-string';

export function createRegionFilter(lookup: CountryLookup, regions: readonly string[]): (item: Timeline) => boolean {
    const includedCountries = pluck(
        'code',
        uniq(regions).flatMap(region => lookup.countriesPerRegion[region]),
    );
    return createCountryFilter(includedCountries);
}

export function createSubRegionFilter(
    lookup: CountryLookup,
    subRegions: readonly string[],
): (item: Timeline) => boolean {
    const includedCountries = pluck(
        'code',
        uniq(subRegions).flatMap(subRegion => lookup.countriesPerSubRegion[subRegion]),
    );
    return createCountryFilter(includedCountries);
}

export function createCountryFilter(includedCountries: string[]): (item: Timeline) => boolean {
    const isIncluded = includesString(includedCountries);
    return (item: Timeline): boolean => isIncluded(item.countryCode);
}
