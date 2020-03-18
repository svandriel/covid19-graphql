import nock from 'nock';
import path from 'path';

import { fetchAll, fetchCovidCsv } from './fetch-covid-csv';
import { StatsType } from './types/stats-type';

const TESTDATA_DIR = path.resolve(__dirname, '..', 'testdata');

describe('fetch covid csv', () => {
    beforeEach(() => {
        nock(
            'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series'
        )
            .get('/time_series_19-covid-Confirmed.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'confirmed.csv'))

            .get('/time_series_19-covid-Deaths.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'deceased.csv'))

            .get('/time_series_19-covid-Recovered.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'recovered.csv'));
    });

    it('works', async () => {
        try {
            const result = await fetchCovidCsv(StatsType.Confirmed);
            expect(result).toMatchSnapshot();
        } catch (err) {
            fail(err);
        }
    });

    it('fetchAll', async () => {
        try {
            const result = await fetchAll();
            expect(result).toMatchSnapshot();
        } catch (err) {
            fail(err);
        }
    });
});
