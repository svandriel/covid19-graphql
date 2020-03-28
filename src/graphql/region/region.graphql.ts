import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        region(name: String!): Region
        regions: [Region!]!
    }

    type Region {
        name: String!
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

    extend type SubRegion {
        region: Region!
    }

    extend type Country {
        region: Region!
    }
`;
