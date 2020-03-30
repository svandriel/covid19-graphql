import { IntValueNode, StringValueNode } from 'graphql';
import moment from 'moment';

import { DATE_FORMAT_REVERSE } from '../../util/date-formats';
import { LocalDate } from './local-date';

describe('LocalDate', () => {
    it('parses a value correctly', () => {
        expect(LocalDate.parseValue('2020-03-20')).toEqual(moment('2020-03-20', DATE_FORMAT_REVERSE, true));
    });

    it('throws an error when the data is in an invalid method', () => {
        expect(() => LocalDate.parseValue('2020-03-20x')).toThrowError(
            'Invalid LocalDate: 2020-03-20x. Use yyyy-mm-dd notation.',
        );
    });

    it('parses an AST node correctly', () => {
        const node: StringValueNode = {
            kind: 'StringValue',
            value: '2020-03-20',
        };
        expect(LocalDate.parseLiteral(node, {})).toEqual(moment('2020-03-20', DATE_FORMAT_REVERSE, true));
    });

    it('throws an error when processing an AST node with a non-string', () => {
        const node: IntValueNode = {
            kind: 'IntValue',
            value: '30',
        };
        expect(() => LocalDate.parseLiteral(node, {})).toThrowError('Expected a String type for LocalDate scalar type');
    });

    it('serializes a value correctly', () => {
        const date = moment('2020-03-20', DATE_FORMAT_REVERSE, true);
        expect(LocalDate.serialize(date)).toBe('2020-03-20');
    });

    it('throws an error when serializing an invalid date', () => {
        const date = moment('2020x-03-20', DATE_FORMAT_REVERSE, true);
        expect(() => LocalDate.serialize(date)).toThrowError('Invalid date, cannot serialize');
    });
});
