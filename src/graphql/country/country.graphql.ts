import { gql } from 'apollo-server-express';

export const typeDefs = gql`
    extend type Query {
        """
        Gets a country by its code.
        Using a Country object, you can obtain its timeline or current statistics.
        """
        country(code: String!): Country

        """
        Gets multiple countries as a filtered, paginated list.
        """
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

    """
    A paginates list of countries.
    """
    type PagedCountries {
        """
        The offset at which data is being returned
        """
        offset: Int!
        """
        The number of items in the 'results' list
        """
        count: Int!
        """
        The total number of items available as a result of current the query
        """
        totalCount: Int!
        """
        Indicates if there is more data available (i.e. offset + count < totalCount)
        """
        hasNext: Boolean!
        """
        A list of re
        """
        results: [Country!]!
    }

    type Country {
        code: String!
        name: String!
        """
        Gets the timeline for this country.
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

    extend type Region {
        countries(offset: Int = 0, count: Int = 10, filter: CountryFilter): PagedCountries!
    }

    extend type SubRegion {
        countries(offset: Int = 0, count: Int = 10, filter: CountryFilter): PagedCountries!
    }
`;
