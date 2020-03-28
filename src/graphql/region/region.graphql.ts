import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        region(name: String!): Region
        regions: [Region!]!
    }

    type Region {
        name: String!
        subRegions: [SubRegion!]!
        countries(offset: Int = 0, count: Int = 10, filter: CountryFilter): PagedCountries!
        timeline(
            """
            Filters time line items to be on or after this date (inclusive)
            """
            from: LocalDate
            """
            Filters time line items to be before this date (exclusive)
            """
            to: LocalDate
        ): [TimelineItem!]!
        latest: TimelineItem
    }
`;
