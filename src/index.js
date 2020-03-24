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
  isNil,
  find,
  path,
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

//
//
// Normalization
//

const normalizeEntry = (itemRaw, i) => {
  if (!itemRaw) {
    return
  }

  const item = camelcaseKeys(itemRaw)
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

    return {
      name,
      confirmed,
      deaths,
      recovered,
      active,
      latitude,
      longitude
    }
  }),
  sortBy(prop('name'))
)

const getCountryData = pipe(
  // Normalize entries
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

    return {
      name,
      // Only pick provinces if they have names
      states: getStateData(states),
      confirmed,
      deaths,
      recovered,
      active,
      latitude,
      longitude
    }
  })
)

//
//
// Fetcher
//

const simpleCovid19JsonFetcher = async targetDate => {
  const date = new Date(targetDate)

  if (!isValid(date)) {
    throw new Error(
      `simpleCovid19JsonFetcher: 'targetDate' is not valid (${targetDate}). See https://date-fns.org/v2.11.0/docs/isValid for details`
    )
  }

  let dateStr = format(date, 'MM-dd-yyyy')

  try {
    const json = await csv(
      `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${dateStr}.csv`
    )
    return getCountryData(json)
  } catch (error) {
    const previousDate = subDays(date, 1)

    // Try to get data with in a week, otherwise just throw
    if (differenceInCalendarDays(date, new Date()) > 7) {
      throw error
    }

    return simpleCovid19JsonFetcher(previousDate)
  }
}

export default simpleCovid19JsonFetcher
