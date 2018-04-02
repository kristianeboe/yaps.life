const admin = require('firebase-admin')
const axios = require('axios')
/* function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7)
  date.setHours(8, 0, 0)
  return date
}
 */

function getBestOrigin(originsToDestinations) {
  // console.log('inside', originsToDestinations)

  const bestOrigin = Object.keys(originsToDestinations).reduce((a, b) =>
    (originsToDestinations[a].combinedDuration <
      originsToDestinations[b].combinedDuration
      ? a
      : b))
  console.log(bestOrigin)
  return bestOrigin
}

function getOriginsToDestinationsObject(origins, flatmates) {
  return new Promise((resolve, reject) => {
    const destinations = flatmates.map(mate => encodeURI(mate.workplace))
    const mode = 'transit'
    // '&departure_time=' + nextMondayAt8
    const requestUrl =
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.join('|')}&destinations=${destinations.join('|')}&mode=${mode}&key=` +
      'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

    console.log(requestUrl)

    return axios(requestUrl)
      .then((response) => {
        console.log(response.data)
        const { data } = response
        const originsToDestinationsObject = {}
        console.log(data)
        if (data.status === 'OK') {
          console.log('Starting extracting data')
          const originAddresses = data.origin_addresses
          const destinationAddresses = data.destination_addresses

          try {
            console.log('inside try')
            for (let i = 0; i < originAddresses.length; i += 1) {
              const results = data.rows[i].elements
              const from = originAddresses[i]
              originsToDestinationsObject[from] = []
              for (let j = 0; j < results.length; j += 1) {
                const element = results[j]
                const { status, distance, duration } = element
                const to = destinationAddresses[j]
                // console.log(from, to, duration.value)
                originsToDestinationsObject[from].push({
                  to,
                  status,
                  distance: status === 'OK' ? distance : '',
                  duration: status === 'OK' ? duration : ''
                })
                // originsToDestinationsObject[from] = [...originsToDestinationsObject[from], {to, duration:duration.value} ]
              }
            }
            console.log(originsToDestinationsObject)
            Object.keys(originsToDestinationsObject).forEach((origin) => {
              let combinedDuration = 0
              const destinationsArray = originsToDestinationsObject[origin]
              destinationsArray.forEach((destination) => {
                combinedDuration += destination.duration.value
              })
              originsToDestinationsObject[
                origin
              ].combinedDuration = combinedDuration
            })
          } catch (error) {
            console.log(error)
          }
        }
        console.log('about to resolve')
        resolve(originsToDestinationsObject)
      })
      .catch(err => console.log('error in axios', reject(err)))
  })
}

function getBestOriginForMatch(match) {
  const originsOsloSmall = {
    'Grunerløkka Oslo': 'location=1.20061.20511&', // Grunerløkka - Sofienberg
    'Majorstuen Oslo': 'location=1.20061.20508&', // Majorstuen, Uranienborg, Nationaltheateret
    'Fronger Oslo': 'location=1.20061.20507&',
    'Gamle Oslo': 'location=1.20061.20512&'
  }
  const origins = Object.keys(originsOsloSmall).map(origin => encodeURI(origin))
  getOriginsToDestinationsObject(origins, match.flatmates)
    .then((originsToDestinationsObject) => {
      const bestOrigin = getBestOrigin(originsToDestinationsObject)

      // console.log(originsToDestinationsObject)
      // console.log(bestOrigin)

      const nrOfFlatmates = match.flatMates.length

      const finnQueryStem =
        'https://www.finn.no/realestate/lettings/search.html?'
      const locationConstraintCity =
        match.location.toLowerCase() === 'oslo' ? 'location=0.20061&' : ''
      let locationConstraintNeighbourhood = ''

      if (bestOrigin.includes('Majorstuen')) {
        locationConstraintNeighbourhood = originsOsloSmall['Majorstuen Oslo']
      } else if (bestOrigin.includes('Grunerløkka')) {
        locationConstraintNeighbourhood = originsOsloSmall['Grunerløkka Oslo']
      } else if (bestOrigin.includes('Frogner')) {
        locationConstraintNeighbourhood = originsOsloSmall['Frogner Oslo']
      } else if (bestOrigin.includes('Gamle Oslo')) {
        locationConstraintNeighbourhood = originsOsloSmall['Gamle Oslo']
      }

      const nrOfBedroomsFrom = `no_of_bedrooms_from=${nrOfFlatmates}&`
      const propertyTypes =
        'property_type=1&property_type=3&property_type=4&property_type=2'

      const finnQueryString =
        finnQueryStem +
        locationConstraintCity +
        locationConstraintNeighbourhood +
        nrOfBedroomsFrom +
        propertyTypes
      const airBnBQueryString = `${'https://www.airbnb.com/s/Oslo--Norway/homes?place_id=ChIJOfBn8mFuQUYRmh4j019gkn4&query=Oslo%2C%20Norway&refinement_paths%5B%5D=%2Fhomes&allow_override%5B%5D=' +
        '&adults='}${nrOfFlatmates}&min_beds=${nrOfFlatmates}&min_bedrooms=${nrOfFlatmates}&s_tag=2D91el1z`

      admin
        .firestore()
        .collection('matches')
        .doc(match.uid)
        .update({ bestOrigin, finnQueryString, airBnBQueryString })
    })
    .catch(err => console.log('Error in getBestOriginFromMatch', err))
}
module.exports.getOriginsToDestinationsObject = getOriginsToDestinationsObject
module.exports.getBestOriginForMatch = getBestOriginForMatch
