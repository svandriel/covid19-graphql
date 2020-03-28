import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    scalar LocalDate

    type Query {
        """
        Aggregates multiple timelines into a single one.
        """
        timeline(
            """
            Filters time line items to be on or after this date (inclusive)
            """
            from: LocalDate
            """
            Filters time line items to be before this date (exclusive)
            """
            to: LocalDate
            """
            Determines which regions to include (default: all)
            """
            regions: [String!]
            """
            Determines which regions to exclude (default: none)
            """
            excludeRegions: [String!]
            """
            Determines which sub-regions to include (default: all)
            """
            subRegions: [String!]
            """
            Determines which sub-regions to exclude (default: none)
            """
            excludeSubRegions: [String!]
            """
            Determines which countries to include (default: all)
            """
            countries: [String!]
            """
            Determines which countries to exclude (default: none)
            """
            excludeCountries: [String!]
        ): [TimelineItem!]!
    }

    type TimelineItem {
        date: LocalDate!
        confirmed: Int!
        deceased: Int!
        recovered: Int!
        lastUpdated: String
    }

    input IncludeExclude {
        """
        List of items to include (default: all)
        """
        include: [String!]
        """
        List of items to exclude (default: none)
        """
        exclude: [String!]
    }
`;
