# Simple COVID-19 JSON Fetcher

### 🦠🦠🦠🦠

Provides a helper function for fetching [Johns Hopkins CSSE's COVID-19 data](https://github.com/CSSEGISandData/COVID-19) formatted by countries and their provinces and states. Fetcher function will automatically fallback to previous date if target date's data is not ready.

## Demo

[Code Sand Box Demo](https://codesandbox.io/s/covid-19-data-z2tw7)

## Install

```javascript
npm install simple-covid19-json-fetcher
```

## Usage

```javascript
import covid19Fetcher from 'simple-covid19-json-fetcher'

;(async () => {
  const covidCountries = await covid19Fetcher(new Date())
})()
```

## API

```javascript
const covidCountries = await covid19Fetcher(targetDate, options)
```

## Options

```javascript
{
  // Setting `fetchRaw` to true will cause the function to
  // return the country data unformatted
  // (keys will still be camelCased)
  fetchRaw: false,

  // Passing an `entryMutator` function enables entries to be manually
  // modified before they are being processed.
  // Useful for renaming country or state names etc.
  entryMutator: null
}
```

## Data Format

```javascript
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

## Entry Mutator Example

`entryMutator` is a function that is passed to a map function at the beginning of the data processing.
It can be used to manipulate the COVID-19 data before its being processed.

```javascript
const covidCountries = await covid19Fetcher(new Date(), {
  entryMutator: entry => {
    if (entry.countryRegion === 'US') {
      return { ...entry, countryRegion: 'United States' }
    }
    return entry
  }
})

const us = covidCountries.find(x => x.name === 'United States') // found!
```

`entryMutator` can be used for filtering. Only the returned entries are included, others are discarded:
```javascript
const usIdahoAndUtah = await covid19Fetcher(new Date(), {
  entryMutator: entry => {
    if (entry.provinceState === 'Idaho' || entry.provinceState === 'Utah') {
      return entry
    }
  }
})

// usIdahoAndUtah ->
[
  {
    "name": "US",
    "states": [
      {
        "name": "Idaho",
        "confirmed": 146,
        "deaths": 3,
        "recovered": 0,
        "active": 143,
        "latitude": 43.4526575,
        "longitude": -116.24155159999998,
        "lastUpdate": "2020-03-26 23:48:35"
      },
      {
        "name": "Utah",
        "confirmed": 396,
        "deaths": 1,
        "recovered": 0,
        "active": 395,
        "latitude": 38.35657051,
        "longitude": -113.2342232,
        "lastUpdate": "2020-03-26 23:48:35"
      }
    ],

    // The following items will contain the combined data of Idaho and Utah. 
    "confirmed": 542,
    "deaths": 4,
    "recovered": 0,
    "active": 538,

    "latitude": 41.851358595810815,
    "longitude": -111.79096034054051,
    "lastUpdate": "2020-03-26 23:48:35"
  }
]

```

Each entry passed to the `entryMutator` has the following properties:

```javascript
{
  "fips": "16087",
  "admin2": "Washington",
  "provinceState": "Idaho",
  "countryRegion": "US",
  "lastUpdate": "2020-03-26 23:48:35",
  "lat": "44.45275475",
  "long": "-116.78476880000001",
  "confirmed": "0",
  "deaths": "0",
  "recovered": "0",
  "active": "0",
  "combinedKey": "Washington, Idaho, US"
}
```

Note, that the data is fetched from [Johns Hopkins CSSE's COVID-19 repository](https://github.com/CSSEGISandData/COVID-19) and may change at any time.


