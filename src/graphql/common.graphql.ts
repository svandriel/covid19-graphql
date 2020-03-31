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

        Takes all country stats by default, but the query can be customized to
        include or exclude regions, subregions and countries.

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

        """
        Aggregates the latest statistics from all countries into a single one.

        Takes all country stats by default, but the query can be customized to
        include or exclude regions, subregions and countries.

        Source data for latest statistics comes from the
        [Coronavirus COVID-19 Global Cases ops dashboard](https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6).
        """
        latest(
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
        ): TimelineItem!
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
        Difference in number of confirmed cases with regard
        to previous timeline item.
        """
        deltaConfirmed: Int
        """
        Number of deceased cases.
        """
        deceased: Int!
        """
        Difference in number of deceased cases with regard
        to previous timeline item.
        """
        deltaDeceased: Int
        """
        Number of recovered cases.

        Please note that this will soon be unavailable:
        [Upcoming changes in time series tables #1250](https://github.com/CSSEGISandData/COVID-19/issues/1250)
        """
        recovered: Int!
        """
        Difference in number of recovered cases with regard
        to previous timeline item.

        Please note that this will soon be unavailable:
        [Upcoming changes in time series tables #1250](https://github.com/CSSEGISandData/COVID-19/issues/1250)
        """
        deltaRecovered: Int
        """
        Date and time of last update (in ISO 8601 format).
        Present only for latest stats, not for historic timelines.
        """
        lastUpdated: String
    }
`;
