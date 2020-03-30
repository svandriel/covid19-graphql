import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        """
        Gets a subregion by its name.
        Using a SubRegion object, you can obtain its aggregated timeline or current statistics.
        """
        subRegion(name: String!): SubRegion
        subRegions: [SubRegion!]!
    }

    type SubRegion {
        """
        The name of the subregion
        """
        name: String!
        """
        Gets the aggregated timeline for this subregion.
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
        latest: TimelineItem!
    }

    extend type Region {
        subRegions: [SubRegion!]!
    }

    extend type Country {
        subRegion: SubRegion!
    }
`;
