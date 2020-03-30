import { pluck, uniq } from 'ramda';

import { CountryLookup } from '../country-lookup';
import { TimeSeries } from '../types/time-series-item';
import { includesString } from '../util/includes-string';

export function createRegionFilter(lookup: CountryLookup, regions: readonly string[]): (item: TimeSeries) => boolean {
    const includedCountries = pluck(
        'code',
        uniq(regions).flatMap(region => lookup.countriesPerRegion[region]),
    );
    return createCountryFilter(includedCountries);
}

export function createSubRegionFilter(
    lookup: CountryLookup,
    subRegions: readonly string[],
): (item: TimeSeries) => boolean {
    const includedCountries = pluck(
        'code',
        uniq(subRegions).flatMap(subRegion => lookup.countriesPerSubRegion[subRegion]),
    );
    return createCountryFilter(includedCountries);
}

export function createCountryFilter(includedCountries: string[]): (item: TimeSeries) => boolean {
    const isIncluded = includesString(includedCountries);
    return (item: TimeSeries): boolean => isIncluded(item.countryCode);
}
