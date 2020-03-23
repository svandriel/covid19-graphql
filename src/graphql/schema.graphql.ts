import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar LocalDate

    type Query {
        ping: String!
        globalHistory(where: TimeSeriesWhere): [TimeSeriesItem!]!

        country(code: String!): Country
    }

    input TimeSeriesWhere {
        """
        Filters time line items to be on or after this date (inclusive)
        """
        from: LocalDate
        """
        Filters time line items to be before this date (exclusive)
        """
        to: LocalDate
    }

    type Country {
        code: String!
        name: String!
        history: [TimeSeriesItem!]!
        latest: TimeSeriesItem!
    }

    type TimeSeriesItem {
        date: LocalDate!
        confirmed: Int!
        deceased: Int!
        recovered: Int!
    }

    enum StatsType {
        CONFIRMED
        DECEASED
        RECOVERED
    }
`;
