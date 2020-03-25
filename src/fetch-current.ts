import moment from 'moment';

import { getCountryLookup } from './country-lookup';
import { fetchEsriData } from './fetch-esri-data';
import { ApiCountry, ApiCountryStat } from './generated/graphql-backend';
import { EsriCurrentStat } from './types/esri';

const CASES_URL =
    'https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/2/query';

export async function fetchCurrent(): Promise<readonly ApiCountryStat[]> {
    const lookupPromise = getCountryLookup();

    const json = await fetchEsriData<EsriCurrentStat>(CASES_URL, {
        offset: 0,
        count: 1000,
        orderBy: {
            Confirmed: 'desc',
        },
    });
    const lookup = await lookupPromise;
    return json.features.map(f => {
        const countryName = f.attributes.Country_Region;
        const countryCode = lookup.lookupCode[countryName];
        const date = moment(f.attributes.Last_Update);
        return {
            confirmed: f.attributes.Confirmed,
            deceased: f.attributes.Deaths,
            recovered: f.attributes.Recovered,
            countryCode,
            country: (undefined as any) as ApiCountry,
            date,
            lastUpdated: f.attributes.Last_Update,
        };
    });
}
