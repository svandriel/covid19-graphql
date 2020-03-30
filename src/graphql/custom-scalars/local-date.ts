import { GraphQLScalarType, Kind, ValueNode } from 'graphql';
import moment, { Moment } from 'moment';

import { DATE_FORMAT_REVERSE } from '../../util/date-formats';

export const LocalDate = new GraphQLScalarType({
    name: 'LocalDate',
    description: 'A date without time or time zone. Serialized as a string in yyyy-mm-dd notation.',
    parseValue(value: string): Moment {
        const date = moment(value, DATE_FORMAT_REVERSE, true);
        if (!date.isValid()) {
            throw new Error(`Invalid LocalDate: ${value}. Use yyyy-mm-dd notation.`);
        }
        return date;
    },
    serialize(value: Moment): string {
        if (value.isValid()) {
            return value.format(DATE_FORMAT_REVERSE);
        } else {
            throw new Error(`Invalid date, cannot serialize`);
        }
    },
    parseLiteral(ast: ValueNode): Moment | undefined {
        if (ast.kind !== Kind.STRING) {
            throw new Error('Expected a String type for LocalDate scalar type');
        }
        const date = moment(ast.value, DATE_FORMAT_REVERSE, true);
        if (!date.isValid()) {
            throw new Error(`Invalid LocalDate: ${ast.value}. Use yyyy-mm-dd notation.`);
        }
        return date;
    },
});
