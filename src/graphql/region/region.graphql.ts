import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        """
        Gets a region by its name.
        Using a Region object, you can obtain its aggregated timeline or current statistics.
        """
        region(name: String!): Region
        regions: [Region!]!
    }

    type Region {
        """
        The name of the region
        """
        name: String!
        """
        Gets the aggregated timeline for this region.
        Source data for timelines comes from the [2019 Novel Coronavirus COVID-19 (2019-nCoV) Data Repository by Johns Hopkins CSSE](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series).
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
        ): [TimelineItem!]!
        latest: Latest!
    }

    extend type SubRegion {
        region: Region!
    }

    extend type Country {
        region: Region!
    }
`;
