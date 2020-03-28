import { Moment } from 'moment';
import { allPass, isNil } from 'ramda';

import { getCountryLookup } from '../country-lookup';
import { ApiCountry, ApiRegion, ApiResolvers, ApiSubRegion, ApiTimelineItem } from '../generated/graphql-backend';
import { paginate } from '../util/paginate';
import { LocalDate } from './custom-scalars/local-date';

export const resolvers: ApiResolvers = {
    Query: {
        globalTimeline: async (_query, { from, to }, context) => {
            const stats = await context.dataSource.getGlobalTimeSeriesFromCsv();
            return applyTimeSeriesRange({ from, to } || {}, stats);
        },
        country: async (_query, { code }) => {
            const lookup = await getCountryLookup();
            const upperCode = code.toUpperCase();
            const country = lookup.lookupByCode[upperCode];
            if (!country) {
                return (undefined as any) as ApiCountry;
            }
            return {
                code: upperCode,
                name: country.name,
                region: (undefined as any) as ApiRegion,
                subRegion: (undefined as any) as ApiSubRegion,
                timeline: [],
                latest: (undefined as any) as ApiTimelineItem,
            };
        },
        countries: async (_query, { offset, count, filter }, context) => {
            const lookup = await getCountryLookup();
            const { search, exclude, hasCases } = filter || {};
            const filters: Array<(item: ApiCountry) => boolean> = [];
            if (search) {
                const upperSearch = search.toUpperCase();
                filters.push((item: ApiCountry) => {
                    return item.name.toUpperCase().indexOf(upperSearch) !== -1 || item.code.indexOf(upperSearch) !== -1;
                });
            }
            if (exclude) {
                filters.push(country => !exclude.includes(country.code));
            }
            if (!isNil(hasCases)) {
                const countriesWithCases = await context.dataSource.getCountryCodesWithCases();
                filters.push(country => countriesWithCases.includes(country.code) === hasCases);
            }

            const countries = (lookup.list as any[]) as ApiCountry[];
            const filteredCountries = countries.filter(allPass(filters));

            return paginate({ offset, count }, filteredCountries);
        },
        region: async (_query, { name }) => {
            const lookup = await getCountryLookup();
            if (!lookup.regionNames.includes(name)) {
                return (undefined as any) as ApiRegion;
            } else {
                return {
                    name,
                    countries: [],
                    subRegions: [],
                    timeline: [],
                } as ApiRegion;
            }
        },
        regions: async () => {
            const lookup = await getCountryLookup();
            return lookup.regionNames.map(name => ({
                countries: [],
                name,
                subRegions: [],
                timeline: [],
            }));
        },
        subRegion: async (_query, { name }) => {
            const lookup = await getCountryLookup();
            if (!lookup.subRegionNames.includes(name)) {
                return (undefined as any) as ApiSubRegion;
            } else {
                return {
                    name,
                    countries: [],
                    region: (undefined as any) as ApiRegion,
                    timeline: [],
                } as ApiSubRegion;
            }
        },
        subRegions: async () => {
            const lookup = await getCountryLookup();
            return lookup.subRegionNames.map(name => ({
                countries: [],
                name,
                subRegions: [],
                timeline: [],
                region: (undefined as any) as ApiRegion,
            }));
        },
    },

    Country: {
        region: async country => {
            const lookup = await getCountryLookup();
            const regionName = lookup.lookupByCode[country.code].region;
            return {
                name: regionName,
                countries: [],
                region: (undefined as any) as ApiRegion,
                timeline: [],
                subRegions: [],
            };
        },
        subRegion: async country => {
            const lookup = await getCountryLookup();
            const subRegionName = lookup.lookupByCode[country.code].subRegion;
            return {
                name: subRegionName,
                countries: [],
                region: (undefined as any) as ApiRegion,
                timeline: [],
            };
        },
        timeline: async (country, { from, to }, context) => {
            const stats = await context.dataSource.getTimelineForCountryFromCsv(country.code);
            if (from || to) {
                return applyTimeSeriesRange({ from, to }, stats);
            } else {
                return stats;
            }
        },
        latest: async (country, _args, context) => {
            return context.dataSource.getCurrentForCountry(country.code) as Promise<ApiTimelineItem>;
        },
    },

    Region: {
        countries: async region => {
            const lookup = await getCountryLookup();
            return lookup.countriesPerRegion[region.name].map(c => ({
                code: c.code,
                name: c.name,
                region: (undefined as any) as ApiRegion,
                subRegion: (undefined as any) as ApiSubRegion,
                timeline: [],
            }));
        },
        subRegions: async region => {
            const lookup = await getCountryLookup();
            return lookup.subRegionsByRegionName[region.name].map(
                name =>
                    ({
                        name,
                        countries: [],
                        region: (undefined as any) as ApiRegion,
                        timeline: [],
                    } as ApiSubRegion),
            );
        },
    },

    SubRegion: {
        countries: async subRegion => {
            const lookup = await getCountryLookup();
            return lookup.countriesPerSubRegion[subRegion.name].map(c => ({
                code: c.code,
                name: c.name,
                region: (undefined as any) as ApiRegion,
                subRegion: (undefined as any) as ApiSubRegion,
                timeline: [],
            }));
        },
        region: async subRegion => {
            const lookup = await getCountryLookup();
            const regionName = lookup.regionPerSubRegion[subRegion.name];
            return {
                name: regionName,
                subRegions: [],
                countries: [],
                timeline: [],
            } as ApiRegion;
        },
    },

    LocalDate,
};

function applyTimeSeriesRange(
    { from, to }: { from?: Moment | null; to?: Moment | null },
    stats: readonly ApiTimelineItem[],
): ApiTimelineItem[] {
    let fromIndex: number = 0;
    let toIndex: number = stats.length;
    if (from) {
        fromIndex = stats.findIndex(i => i.date >= from);
        if (fromIndex === -1) {
            fromIndex = 0;
        }
    }
    if (to) {
        toIndex = stats.findIndex(i => i.date >= to);
        if (toIndex === -1) {
            toIndex = stats.length;
        }
    }
    return stats.slice(fromIndex, toIndex);
}
