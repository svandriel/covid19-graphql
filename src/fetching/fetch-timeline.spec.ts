import nock from 'nock';
import path from 'path';

import { fetchCsvBasedTimeline } from './fetch-timeline';

const TESTDATA_DIR = path.resolve(__dirname, '..', '..', 'testdata');

describe('fetchCsvBasedTimeSeries', () => {
    beforeEach(() => {
        nock(
            'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series',
        )
            .get('/time_series_covid19_confirmed_global.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'confirmed.csv'))

            .get('/time_series_covid19_deaths_global.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'deceased.csv'))

            .get('/time_series_covid19_recovered_global.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'recovered.csv'));

        nock('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all')
            .get('/all.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'all.csv'));
    });

    it('works', async () => {
        try {
            const result = await fetchCsvBasedTimeline();
            expect(result).toMatchSnapshot();
        } catch (err) {
            fail(err);
        }
    });
});
