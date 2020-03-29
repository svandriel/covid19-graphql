import nock from 'nock';

import { fetchCsv } from './fetch-csv';

describe('fetchCsv', () => {
    beforeEach(() => {
        nock('https://example.com')
            .get('/file.csv')
            .reply(200, `One,Two\n1,2\n3,4`);
        nock('https://example.com')
            .get('/timeout.csv')
            .replyWithError('Timeout');
        nock('https://example.com')
            .get('/server-error.csv')
            .reply(500, 'Server error');
        nock('https://example.com')
            .get('/malformed.csv')
            .reply(200, `One,Two\n1,"2\n3,4`);
    });

    it('works', async () => {
        try {
            const result = await fetchCsv('https://example.com/file.csv');
            expect(result).toMatchSnapshot();
        } catch (err) {
            fail(err);
        }
    });

    it('fails on invalid CSV', async () => {
        try {
            await fetchCsv('https://example.com/malformed.csv');
            fail('Expected error');
        } catch (err) {
            expect(err.message).toBe('Quote Not Closed: the parsing is finished with an opening quote at line 3');
        }
    });

    it('fails on timeout', async () => {
        try {
            await fetchCsv('https://example.com/timeout.csv');
            fail('Expected error');
        } catch (err) {
            expect(err.message).toBe('request to https://example.com/timeout.csv failed, reason: Timeout');
        }
    });

    it('fails on server error', async () => {
        try {
            await fetchCsv('https://example.com/server-error.csv');
            fail('Expected error');
        } catch (err) {
            expect(err.message).toBe('Got HTTP 500 on https://example.com/server-error.csv (expected HTTP 200)');
        }
    });
});
