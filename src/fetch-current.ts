import chalk from 'chalk';
import moment from 'moment';

import { getCountryLookup } from './country-lookup';
import { fetchEsriData } from './esri/fetch-esri-data';
import { CountryStat } from './types/country-stat';
import { EsriCurrentStat } from './types/esri';
import { ESRI_CASES_URL } from './urls';
import { compact } from './util/compact';

export async function fetchCurrent(): Promise<readonly CountryStat[]> {
    const lookupPromise = getCountryLookup();

    const json = await fetchEsriData<EsriCurrentStat>(ESRI_CASES_URL, {
        offset: 0,
        count: 1000,
        orderBy: {
            Confirmed: 'desc',
        },
    });
    const lookup = await lookupPromise;
    const results = json.features.map(f => {
        const countryName = f.attributes.Country_Region;
        const country = lookup.lookupByName[countryName];
        if (!country) {
            console.error(`fetchCurrent ${chalk.red('ERROR')}: Country not found: ${countryName}`);
            return undefined;
        }
        const lastUpdated = moment(f.attributes.Last_Update);
        return {
            confirmed: f.attributes.Confirmed,
            deceased: f.attributes.Deaths,
            recovered: f.attributes.Recovered,
            countryCode: country.code,
            lastUpdated,
        };
    });
    return compact(results);
}
