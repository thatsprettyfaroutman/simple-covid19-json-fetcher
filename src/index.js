import 'whatwg-fetch'
import {
  fromPairs,
  toPairs,
  pipe,
  map,
  omit,
  filter,
  groupBy,
  prop,
  pluck,
  sum,
  sortBy,
  sort,
  isNil,
  find,
  path,
  head,
  __
} from 'ramda'
import { csv } from 'd3-fetch'
import { format, subDays, isValid, differenceInCalendarDays } from 'date-fns'
import camelcase from 'lodash.camelcase'

//
//
// Helpers
//

const camelcaseKeys = pipe(
  toPairs,
  map(([key, value]) => [camelcase(key), value]),
  fromPairs
)

const getSumOfProp = pipe(pluck, sum)

const getAverageOfProp = (prop, data) => getSumOfProp(prop, data) / data.length

const getFirstOfProp = (prop, data) =>
  pipe(
    find(x => !isNil(x[prop])),
    path([prop])
  )(data)

const getLatestDate = pipe(
  pluck,
  sort((a, b) => (a < b ? 1 : -1)),
  head
)

//
//
// Normalization
//

const normalizeEntry = item => {
  if (!item) {
    return
  }

  const baseItem = omit(['lat', 'long'], item)
  const latitude = Number(item.latitude || item.lat)
  const longitude = Number(item.longitude || item.long)
  const confirmed = Number(item.confirmed || 0)
  const deaths = Number(item.deaths || 0)
  const recovered = Number(item.recovered || 0)
  const active = confirmed - recovered - deaths

  const nextItem = {
    ...baseItem,
    latitude,
    longitude,
    confirmed,
    deaths,
    recovered,
    active
  }

  return nextItem
}

const getStateData = pipe(
  filter(prop('provinceState')),
  groupBy(prop('provinceState')),
  toPairs,
  map(([name, entries]) => {
    const confirmed = getSumOfProp('confirmed', entries)
    const deaths = getSumOfProp('deaths', entries)
    const recovered = getSumOfProp('recovered', entries)
    const active = getSumOfProp('active', entries)
    const latitude = getFirstOfProp('latitude', entries)
    const longitude = getFirstOfProp('longitude', entries)
    const lastUpdate = getLatestDate('lastUpdate', entries)

    return {
      name,
      confirmed,
      deaths,
      recovered,
      active,
      latitude,
      longitude,
      lastUpdate
    }
  }),
  sortBy(prop('name'))
)

const getCountryData = (data, entryMutator) =>
  pipe(
    // Normalize entries
    map(camelcaseKeys),
    map((x, ...restArgs) => (entryMutator ? entryMutator(x, ...restArgs) : x)),
    map(normalizeEntry),
    filter(Boolean),

    // Group by countries
    groupBy(prop('countryRegion')),
    toPairs,

    // Fix country data
    map(([name, states]) => {
      const confirmed = getSumOfProp('confirmed', states)
      const deaths = getSumOfProp('deaths', states)
      const recovered = getSumOfProp('recovered', states)
      const active = getSumOfProp('active', states)

      // Calculate country latitude and longitude. Not ideal
      const latitude = getAverageOfProp('latitude', states)
      const longitude = getAverageOfProp('longitude', states)
      const lastUpdate = getLatestDate('lastUpdate', states)

      return {
        name,
        states: getStateData(states),
        confirmed,
        deaths,
        recovered,
        active,
        latitude,
        longitude,
        lastUpdate
      }
    })
  )(data)

//
//
// Fetcher
//

const simpleCovid19JsonFetcher = async (targetDate, options = {}) => {
  const date = new Date(targetDate)
  const { fetchRaw, entryMutator } = {
    ...{ fetchRaw: false, entryMutator: null },
    ...options
  }

  if (!isValid(date)) {
    throw new Error(
      `simpleCovid19JsonFetcher: 'targetDate' is not valid (${targetDate}). See https://date-fns.org/v2.11.0/docs/isValid for details`
    )
  }

  const dateStr = format(date, 'MM-dd-yyyy')

  try {
    const json = await csv(
      `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${dateStr}.csv`
    )

    if (fetchRaw) {
      return Array.isArray(json)
        ? json
            .map(camelcaseKeys)
            .map((x, ...restArgs) =>
              entryMutator ? entryMutator(x, ...restArgs) : x
            )
            .filter(Boolean)
        : json
    }

    return getCountryData(json, entryMutator)
  } catch (error) {
    const previousDate = subDays(date, 1)

    // Try to get data with in a week, otherwise just throw
    if (differenceInCalendarDays(date, new Date()) > 7) {
      throw error
    }

    return simpleCovid19JsonFetcher(previousDate, { fetchRaw, entryMutator })
  }
}

export default simpleCovid19JsonFetcher
