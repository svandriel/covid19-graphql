import chalk from 'chalk';
import fetch from 'node-fetch';
import querystring from 'querystring';

import { EsriQuery, EsriResponse } from '../types/esri';

export async function fetchPagedEsriData<T>(url: string, query: EsriQuery): Promise<readonly T[]> {
    let done = false;
    let offset = 0;
    const count = 1000;
    const results: T[] = [];
    while (!done) {
        const actualQuery: EsriQuery = {
            ...query,
            offset,
            count,
        };
        const response = await fetchEsriData<T>(url, actualQuery);
        results.push(...response.features.map(f => f.attributes));
        done = !response.exceededTransferLimit;
        offset += count;
    }

    return results;
}

export async function fetchEsriData<T>(url: string, query: EsriQuery): Promise<EsriResponse<T>> {
    const { outFields, orderBy, offset, count, where } = query;

    const orderByFields = orderBy
        ? Object.entries(orderBy)
              .map(([field, direction]) => {
                  return `${field} ${direction}`;
              })
              .join(',')
        : undefined;

    const qs = {
        f: 'json',
        returnGeometry: 'false',
        spatialRel: 'esriSpatialRelIntersects',
        cacheHint: true,
        outFields: outFields?.join(',') || '*',
        where: where || '1=1',
        orderByFields,
        resultOffset: offset,
        resultRecordCount: count,
    };
    const urlQs = `${url}?${querystring.stringify(qs)}`;
    console.log(`Fetching ${chalk.cyan(urlQs)}`);
    const response = await fetch(urlQs, {
        headers: {
            Referer: 'https://www.arcgis.com/apps/opsdashboard/index.html',
        },
    });
    if (response.status !== 200) {
        throw new Error(`Got HTTP ${response.status} on ${url}`);
    }
    return response.json();
}
