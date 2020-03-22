import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    type Query {
        ping: String!
        global: [TimeSeriesItem!]!
        country(code: String!): [TimeSeriesItem!]!
    }

    input TimeSeriesWhere {
        countryCode: String
        state: String
    }

    type TimeSeriesItem {
        date: String!
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
