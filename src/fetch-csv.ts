import csvParse from 'csv-parse';
import fetch from 'node-fetch';

export async function fetchCsv(url: string): Promise<Array<Record<string, string>>> {
    return new Promise<Array<Record<string, string>>>(async (resolve, reject) => {
        const response = await fetch(url);
        const text = await response.text();
        csvParse(
            text,
            {
                columns: true,
                delimiter: ','
            },
            (err, output) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(output);
                }
            }
        );
    });
}
