export interface CountryPredicateOptions {
    regions?: readonly string[] | null;
    excludeRegions?: readonly string[] | null;
    subRegions?: readonly string[] | null;
    excludeSubRegions?: readonly string[] | null;
    countries?: readonly string[] | null;
    excludeCountries?: readonly string[] | null;
}
