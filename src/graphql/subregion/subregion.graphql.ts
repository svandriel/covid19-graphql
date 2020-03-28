import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        subRegion(name: String!): SubRegion
        subRegions: [SubRegion!]!
    }

    type SubRegion {
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

    extend type Region {
        subRegions: [SubRegion!]!
    }

    extend type Country {
        subRegion: SubRegion!
    }
`;
