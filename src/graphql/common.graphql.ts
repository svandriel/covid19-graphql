import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar LocalDate

    type Query {
        """
        Aggregates all data into a single global timeline.
        """
        globalTimeline(
            """
            Filters time line items to be on or after this date (inclusive)
            """
            from: LocalDate
            """
            Filters time line items to be before this date (exclusive)
            """
            to: LocalDate
        ): [TimelineItem!]!
    }

    type TimelineItem {
        date: LocalDate!
        confirmed: Int!
        deceased: Int!
        recovered: Int!
        lastUpdated: String
    }
`;
