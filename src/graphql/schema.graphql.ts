import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar LocalDate

    type Query {
        ping: String!
        globalHistory(where: TimeSeriesWhere): [TimeSeriesItem!]!

        country(code: String!): Country
        countries(offset: Int = 0, count: Int = 10, where: CountriesWhere): PagedCountries!
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

    input CountriesWhere {
        ignore: [String!]
    }

    type PagedCountries {
        offset: Int!
        count: Int!
        totalCount: Int!
        hasNext: Boolean!
        results: [Country!]!
    }

    type Country {
        code: String!
        name: String!
        history(where: TimeSeriesWhere): [TimeSeriesItem!]!
        latest: TimeSeriesItem!
    }

    type TimeSeries {
        countryCode: String!
        state: String!
        items: [TimeSeriesItem!]!
    }

    type CountryTimeSeries {
        countryCode: String!
        country: Country!
        items: [TimeSeriesItem!]!
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
