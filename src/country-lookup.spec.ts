import nock from 'nock';
import path from 'path';
import { getCountryLookup } from './country-lookup';

const TESTDATA_DIR = path.resolve(__dirname, '..', 'testdata');

describe('Country lookup', () => {
    beforeEach(() => {
        nock('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all')
            .get('/all.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'all.csv'));
    });
    it('works', async () => {
        expect(await getCountryLookup()).toMatchSnapshot();
    });
});
