import { allPass, complement, pluck, uniq } from 'ramda';

import { CountryLookup } from '../country-lookup';
import { CountryPredicateOptions } from '../types/country-filter-options';
import { includesString } from '../util/includes-string';

export function countryPredicate(
    lookup: CountryLookup,
    opts: CountryPredicateOptions,
): (countryCode: string) => boolean {
    const { regions, excludeRegions, subRegions, excludeSubRegions, countries, excludeCountries } = opts;

    const predicates: Array<(countryCode: string) => boolean> = [];

    if (regions) {
        predicates.push(createRegionPredicate(lookup, regions));
    }
    if (excludeRegions) {
        predicates.push(complement(createRegionPredicate(lookup, excludeRegions)));
    }
    if (subRegions) {
        predicates.push(createSubRegionPredicate(lookup, subRegions));
    }
    if (excludeSubRegions) {
        predicates.push(complement(createSubRegionPredicate(lookup, excludeSubRegions)));
    }
    if (countries) {
        predicates.push(createCountryPredicate(uniq(countries)));
    }
    if (excludeCountries) {
        predicates.push(complement(createCountryPredicate(uniq(excludeCountries))));
    }

    // Optimizations
    switch (predicates.length) {
        case 0:
            return () => true;
        case 1:
            return predicates[0];
        default:
            return allPass(predicates);
    }
}

function createRegionPredicate(lookup: CountryLookup, regions: readonly string[]): (countryCode: string) => boolean {
    const includedCountries = pluck(
        'code',
        uniq(regions).flatMap(region => lookup.countriesPerRegion[region]),
    );
    return createCountryPredicate(includedCountries);
}

function createSubRegionPredicate(
    lookup: CountryLookup,
    subRegions: readonly string[],
): (countryCode: string) => boolean {
    const includedCountries = pluck(
        'code',
        uniq(subRegions).flatMap(subRegion => lookup.countriesPerSubRegion[subRegion]),
    );
    return createCountryPredicate(includedCountries);
}

function createCountryPredicate(includedCountries: string[]): (countryCode: string) => boolean {
    return includesString(includedCountries);
}
