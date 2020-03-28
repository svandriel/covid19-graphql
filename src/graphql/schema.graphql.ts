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

        region(name: String!): Region
        regions: [Region!]!

        subRegion(name: String!): SubRegion
        subRegions: [SubRegion!]!

        country(code: String!): Country
        countries(offset: Int = 0, count: Int = 10, filter: CountryFilter): PagedCountries!
    }

    """
    Filters countries based on certain conditions
    """
    input CountryFilter {
        """
        Search text, will match countries' names and codes
        """
        search: String
        """
        A list of country codes to include
        """
        include: [String!]
        """
        A list of country codes to exclude
        """
        exclude: [String!]
        """
        Only includes countries with or without cases
        """
        hasCases: Boolean
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
        region: Region!
        subRegion: SubRegion!
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

    type SubRegion {
        name: String!
        region: Region!
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

    type TimelineItem {
        date: LocalDate!
        confirmed: Int!
        deceased: Int!
        recovered: Int!
        lastUpdated: String
    }
`;
