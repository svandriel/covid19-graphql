import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    """
    A date notation without a time or timezone.
    Formatted as yyyy-mm-dd.
    """
    scalar LocalDate

    """
    Root of all queries.
    """
    type Query {
        """
        Aggregates multiple timelines into a single one.
        Source data for timelines comes from the [2019 Novel Coronavirus COVID-19 (2019-nCoV) Data Repository by Johns Hopkins CSSE](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series).
        """
        timeline(
            """
            Filters time line items to be on or after this date (inclusive).
            Format: yyyy-mm-dd
            """
            from: LocalDate
            """
            Filters time line items to be before this date (exclusive)
            Format: yyyy-mm-dd
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
            Determines which subregions to include (default: all)
            """
            subRegions: [String!]
            """
            Determines which subregions to exclude (default: none)
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

    """
    A single point in a timeline.
    """
    type TimelineItem {
        date: LocalDate!
        """
        Number of confirmed cases.
        """
        confirmed: Int!
        """
        Number of deceased cases.
        """
        deceased: Int!
        """
        Number of recovered cases.
        Please note that this will soon be unavailable:
        [notes](https://github.com/CSSEGISandData/COVID-19/issues/1250)
        """
        recovered: Int!
        """
        Date and time of last update (in ISO 8601 format).
        Present only for latest stats, not for historic timelines.
        """
        lastUpdated: String
    }
`;
