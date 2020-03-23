import { GraphQLScalarType, Kind, ValueNode } from 'graphql';
import moment, { Moment } from 'moment';

import { DATE_FORMAT_REVERSE } from '../../util/date-formats';

export const LocalDate = new GraphQLScalarType({
    name: 'LocalDate',
    description: 'A date without time or time zone. Will be serialized as a string.',
    parseValue(value: string): Moment {
        const date = moment(value, DATE_FORMAT_REVERSE, true);
        if (!date.isValid()) {
            throw new Error(`Invalid LocalDate: ${value}`);
        }
        return date;
    },
    serialize(value: Moment): string {
        return value.format(DATE_FORMAT_REVERSE);
    },
    parseLiteral(ast: ValueNode): Moment | undefined {
        if (ast.kind !== Kind.STRING) {
            return undefined;
        }
        const date = moment(ast.value, DATE_FORMAT_REVERSE, true);
        if (!date.isValid()) {
            throw new Error(`Invalid LocalDate: ${ast.value}`);
        }
        return date;
    }
});
