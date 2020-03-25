# Simple COVID-19 JSON Fetcher

Fetches data from Johns Hopkins CSSE - [2019 Novel Coronavirus COVID-19 (2019-nCoV) Data Repository](https://github.com/CSSEGISandData/COVID-19)

## Install

```
npm install simple-covid19-json-fetcher
```

## Usage

```
import covidFetcher from 'simple-covid19-json-fetcher'

;(async () => {

  // Attempt to fetch today's data, will fallback to yesterday's data
  const covidCountries = await covidFetcher(new Date())

})()
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
