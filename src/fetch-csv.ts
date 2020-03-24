import chalk from 'chalk';
import csvParse from 'csv-parse';
import fetch, { FetchError } from 'node-fetch';

export interface CsvContent extends Array<Record<string, string>> {}

export async function fetchCsv(url: string): Promise<CsvContent> {
    return new Promise<CsvContent>(async (resolve, reject) => {
        try {
            console.log(`Fetching ${chalk.cyan(url)}`);
            const response = await fetch(url);
            if (response.status !== 200) {
                throw new FetchError(`Got HTTP ${response.status} on ${url} (expected HTTP 200)`, 'ENOTFOUND');
            }
            const text = await response.text();
            csvParse(
                text,
                {
                    columns: true,
                    delimiter: ',',
                    quote: '"',
                    bom: true
                },
                (err, output) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(output);
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}
