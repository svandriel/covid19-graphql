# COVID-19 GraphQL API

Live API: [covid19-graphql.herokuapp.com](https://covid19-graphql.herokuapp.com/) (playground)

Provides a GraphQL API for the [COVID-19 data source](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data) from Johns Hopkins university.

## Features

- Provides current statistics per country, subregion and region
- Provides timelines per country, subregion and region
- Lightning fast
- Easy to run locally:
  ```
  npx covid19-graphql
  ```

## Examples

### Latest statistics

```graphql
{
  latest {
    confirmed
    deceased
    recovered
    lastUpdated
  }
}
```

[Execute this query &raquo;](https://covid19-graphql.herokuapp.com/?query=%7B%0A%20%20latest%20%7B%0A%20%20%20%20confirmed%0A%20%20%20%20deceased%0A%20%20%20%20recovered%0A%20%20%20%20lastUpdated%0A%20%20%7D%0A%7D)

### Global timeline since March 2020, excluding China

```
{
  timeline(
    excludeCountries: "CN",
    from: "2020-03-01"
  ) {
    date
    confirmed
  }
}
```

[Execute this query &raquo;](<https://covid19-graphql.herokuapp.com/?query=%7B%0A%20%20timeline(excludeCountries%3A%20%22CN%22%2C%20from%3A%20%222020-03-01%22)%20%7B%0A%20%20%20%20date%0A%20%20%20%20confirmed%0A%20%20%7D%0A%7D%0A>)

### Latest statistics for each country in Southern Europe:

```
{
  subRegion(name: "Southern Europe") {
    countries(count: 20) {
      count
      totalCount
      hasNext
      results {
        name
        latest {
          lastUpdated
          deceased
        }
      }
    }
  }
}
```

[Execute this query &raquo;](<https://covid19-graphql.herokuapp.com/?query=%7B%0A%20%20subRegion(name%3A%20%22Southern%20Europe%22)%20%7B%0A%20%20%20%20countries(count%3A%2020%2C%20filter%3A%20%7B%20hasCases%3A%20true%20%7D)%20%7B%0A%20%20%20%20%20%20count%0A%20%20%20%20%20%20totalCount%0A%20%20%20%20%20%20hasNext%0A%20%20%20%20%20%20results%20%7B%0A%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20latest%20%7B%0A%20%20%20%20%20%20%20%20%20%20lastUpdated%0A%20%20%20%20%20%20%20%20%20%20deceased%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)

### List all countries with confirmed cases, by region and subregion

```
{
  regions {
    name
    subRegions {
      name
      countries(count: 100, filter: { hasCases: true }) {
        results {
          name
        }
      }
    }
  }
}
```

[Execute this query &raquo;](<https://covid19-graphql.herokuapp.com/?query=%7B%0A%20%20regions%20%7B%0A%20%20%20%20name%0A%20%20%20%20subRegions%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20countries(count%3A%20100%2C%20filter%3A%20%7B%20hasCases%3A%20true%20%7D)%20%7B%0A%20%20%20%20%20%20%20%20results%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>)

# Running it locally

In order to be in control of your own API endpoint instead of relying on someone else's, you can spin up a COVID19 GraphQL server locally with `npx`:

```
npx covid19-graphql
```

Or install it globally:

```
npm install -g covid19-graphql
```

Then you can run by entering:

```
covid19-graphql
```

## Environment variables

The following environment variables affect the configuration of the server:

- `NODE_ENV`: When set to `production`, will enable tracing, playground and various other debugging settings.
- `PORT`: Determines the HTTP port on which the server will run (defaults to port 12000)
- `ENABLE_TRACING`: Overrides the default GraphQL tracing setting (on for development, off for production). Use `1` to turn on `0` to turn off.
- `ENABLE_PLAYGROUND`: Overrides the default GraphQL playground flag (on for development, off for production). Use `1` to turn on `0` to turn off.

Example:

```
PORT=8080 covid19-graphql
```
