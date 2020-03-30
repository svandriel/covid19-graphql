import { compact } from './compact';

describe('compact', () => {
    it('removes nil values from a list', () => {
        expect(compact([1, null, false, 2, 0, undefined, 3, 5, '', 'one'])).toEqual([1, false, 2, 0, 3, 5, '', 'one']);
    });
});
