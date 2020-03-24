import { head, pipe, find, path } from 'ramda'
import { addDays } from 'date-fns'
import covid19Fetcher from './'

// Helpers
// ----------------------------------------------------------------------------

const getFirstCountry = head

const getFirstState = pipe(
  find(x => x.states.length),
  path(['states', 0])
)

// Tests
// ----------------------------------------------------------------------------

describe('Succesfully fetch data', () => {
  test('Get latest data', async () => {
    const countries = await covid19Fetcher(new Date())

    const country = getFirstCountry(countries)
    const state = getFirstState(countries)

    expect(countries).toBeTruthy()
    expect(country).toHaveProperty('name')
    expect(country).toHaveProperty('states')
    expect(country).toHaveProperty('active')
    expect(country).toHaveProperty('confirmed')
    expect(country).toHaveProperty('deaths')
    expect(country).toHaveProperty('recovered')
    expect(country).toHaveProperty('latitude')
    expect(country).toHaveProperty('longitude')
    expect(state).toHaveProperty('name')
    expect(state).toHaveProperty('active')
    expect(state).toHaveProperty('confirmed')
    expect(state).toHaveProperty('deaths')
    expect(state).toHaveProperty('recovered')
    expect(state).toHaveProperty('latitude')
    expect(state).toHaveProperty('longitude')
  })

  test('Get data in older format (2020-03-22)', async () => {
    const countries = await covid19Fetcher(new Date('2020-03-22'))

    const country = getFirstCountry(countries)
    const state = getFirstState(countries)

    expect(countries).toBeTruthy()
    expect(country).toHaveProperty('name')
    expect(country).toHaveProperty('states')
    expect(country).toHaveProperty('active')
    expect(country).toHaveProperty('confirmed')
    expect(country).toHaveProperty('deaths')
    expect(country).toHaveProperty('recovered')
    expect(country).toHaveProperty('latitude')
    expect(country).toHaveProperty('longitude')
    expect(state).toHaveProperty('name')
    expect(state).toHaveProperty('active')
    expect(state).toHaveProperty('confirmed')
    expect(state).toHaveProperty('deaths')
    expect(state).toHaveProperty('recovered')
    expect(state).toHaveProperty('latitude')
    expect(state).toHaveProperty('longitude')
  })

  test('Get todays data when fetching with tomorrows date', async () => {
    const countries = await covid19Fetcher(addDays(new Date(), 1))

    const country = getFirstCountry(countries)
    const state = getFirstState(countries)

    expect(countries).toBeTruthy()
    expect(country).toHaveProperty('name')
    expect(country).toHaveProperty('states')
    expect(country).toHaveProperty('active')
    expect(country).toHaveProperty('confirmed')
    expect(country).toHaveProperty('deaths')
    expect(country).toHaveProperty('recovered')
    expect(country).toHaveProperty('latitude')
    expect(country).toHaveProperty('longitude')
    expect(state).toHaveProperty('name')
    expect(state).toHaveProperty('active')
    expect(state).toHaveProperty('confirmed')
    expect(state).toHaveProperty('deaths')
    expect(state).toHaveProperty('recovered')
    expect(state).toHaveProperty('latitude')
    expect(state).toHaveProperty('longitude')
  })
})

describe('Unsuccesfully fetch data', () => {
  test('404 because date too far in future', async () => {
    expect(covid19Fetcher(addDays(new Date(), 20))).rejects.toThrow()
  })
})
