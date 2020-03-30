import nock from 'nock';
import path from 'path';

import { fetchCurrent } from './fetch-current';

const TESTDATA_DIR = path.resolve(__dirname, '..', '..', 'testdata');

describe('fetchCurrent', () => {
    beforeEach(() => {
        nock('https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/2')
            .get(
                '/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&cacheHint=true&outFields=*&where=1%3D1&orderByFields=Confirmed%20desc&resultOffset=0&resultRecordCount=1000',
            )
            .replyWithFile(200, path.join(TESTDATA_DIR, 'cases.json'));

        nock('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all')
            .get('/all.csv')
            .replyWithFile(200, path.join(TESTDATA_DIR, 'all.csv'));
    });

    it('works', async () => {
        try {
            const result = await fetchCurrent();
            expect(result).toMatchSnapshot();
        } catch (err) {
            fail(err);
        }
    });
});
