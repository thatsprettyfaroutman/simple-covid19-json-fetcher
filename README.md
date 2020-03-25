# Simple COVID-19 JSON Fetcher

### 🦠🦠🦠🦠

Provides a helper function for fetching [Johns Hopkins CSSE's COVID-19 data](https://github.com/CSSEGISandData/COVID-19) formatted by countries and their provinces and states. Fetcher function will automatically fallback to previous date if target date's data is not ready.

## Demo

[Code Sand Box Demo](https://codesandbox.io/s/covid-19-data-z2tw7)

## Install

```
npm install simple-covid19-json-fetcher
```

## Usage

```
import covidFetcher from 'simple-covid19-json-fetcher'

;(async () => {
  const covidCountries = await covidFetcher(new Date())
})()
```

## API

```
const covidCountries = await covidFetcher(targetDate, options)
```

## Options

```
{
  // Setting `fetchRaw` to true will cause the function to
  // return the country data unformatted
  // (keys will still be camelCased)
  fetchRaw: false,

  // Passing a `entryMutator` function enables entries to be manually
  // modified before they are being processed.
  // Useful for renaming country or state names etc.
  entryMutator: null
}
```

## Data Format

```
[
  {
    name: 'US',
    confirmed: 53740,
    deaths: 706,
    recovered: 348,
    active: 52686,
    latitude: 38.084445254260665,
    longitude: -91.34862805287611,
    states: [
      {
        name: 'Alabama',
        confirmed: 242,
        deaths: 0,
        recovered: 0,
        active: 242,
        latitude: 32.53952745,
        longitude: -86.64408227
      },
      ...more states

    ]
  },
  ...more countries

]
```
