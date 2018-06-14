import * as admin from 'firebase-admin'
import axios from 'axios'
/* function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7)
  date.setHours(8, 0, 0)
  return date
}
 */

export function getBestOrigin(originsToDestinations) {
  // console.log('inside', originsToDestinations)
  const originKeys = Object.keys(originsToDestinations)
  if (originKeys.length === 0) {
    return 'Could not determine, did not receive any origins'
  }
  const bestOrigin = originKeys.reduce((a, b) =>
    (originsToDestinations[a].combinedDuration <
      originsToDestinations[b].combinedDuration
      ? a
      : b))
  return bestOrigin
}

export async function getOriginsToDestinationsObject(origins, flatmates) {
    const destinations = flatmates.map(mate => encodeURI(`${mate.workplaceLatLng.lat},${mate.workplaceLatLng.lng}`))
    const mode = 'transit'
    // '&departure_time=' + nextMondayAt8
    const requestUrl =
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.join('|')}&destinations=${destinations.join('|')}&mode=${mode}&key=` +
      'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'


    const response = await axios.get(requestUrl)

    const { data } = response
    const originsToDestinationsObject = {}
    if (data.status === 'OK') {
      const originAddresses = data.origin_addresses
      const destinationAddresses = data.destination_addresses

      try {
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
      return originsToDestinationsObject
    }

export async function getBestOriginForMatch(match) {
  const originsOsloSmall = {
    'Grunerløkka Oslo': 'location=1.20061.20511&', // Grunerløkka - Sofienberg
    'Majorstuen Oslo': 'location=1.20061.20508&', // Majorstuen, Uranienborg, Nationaltheateret
    'Frogner Oslo': 'location=1.20061.20507&',
    'Gamle Oslo': 'location=1.20061.20512&'
  }
  const origins = Object.keys(originsOsloSmall).map(origin => encodeURI(origin))
  const originsToDestinationsObject = await getOriginsToDestinationsObject(origins, match.flatmates)

  const bestOrigin = getBestOrigin(originsToDestinationsObject)

  // console.log(originsToDestinationsObject)
  // console.log(bestOrigin)

  const nrOfFlatmates = match.flatmates.length

  const finnQueryStem =
    'https://www.finn.no/realestate/lettings/search.html?'
  const locationConstraintCity =
    match.location.toLowerCase() === 'oslo' ? 'location=0.20061&' : ''
  let locationConstraintNeighbourhood = ''

  if (bestOrigin.includes('Majorstuen')) {
    locationConstraintNeighbourhood = originsOsloSmall['Majorstuen Oslo']
  } else if (bestOrigin.includes('Sofienberg')) {
    locationConstraintNeighbourhood = originsOsloSmall['Grunerløkka Oslo']
  } else if (bestOrigin.includes('Frogner')) {
    locationConstraintNeighbourhood = originsOsloSmall['Frogner Oslo']
  } else if (bestOrigin.includes('Gamle Oslo')) {
    locationConstraintNeighbourhood = originsOsloSmall['Gamle Oslo']
  }

  const nrOfBedroomsFrom = `no_of_bedrooms_from=${nrOfFlatmates}&`
  const propertyTypes = nrOfFlatmates === 1 ? 'property_type=17' : 
    'property_type=1&property_type=3&property_type=4&property_type=2'
  const priceTo = match.groupPropertyVector[0] < 2 ? 5000*nrOfFlatmates : match.groupPropertyVector[0] < 4 ? 7000*nrOfFlatmates : 9000*nrOfFlatmates
  const priceToString = `&price_to=${priceTo}`
  const finnQueryString =
    finnQueryStem +
    locationConstraintCity +
    locationConstraintNeighbourhood +
    nrOfBedroomsFrom +
    propertyTypes +
    priceToString

  const airBnBQueryString = `${'https://www.airbnb.com/s/Oslo--Norway/homes?place_id=ChIJOfBn8mFuQUYRmh4j019gkn4&query=Oslo%2C%20Norway&refinement_paths%5B%5D=%2Fhomes&allow_override%5B%5D=' +
    '&adults='}${nrOfFlatmates}&min_beds=${nrOfFlatmates}&min_bedrooms=${nrOfFlatmates}&s_tag=2D91el1z`

  await admin
    .firestore()
    .collection('matches')
    .doc(match.uid)
    .update({ bestOrigin, finnQueryString, airBnBQueryString })

  
  return {...match, bestOrigin, finnQueryString, airBnBQueryString}
}


export async function getAverageCommuteTime(address, flatmates) {
  const origins = [encodeURI(address)]
  const originsToDestinationsObject = await getOriginsToDestinationsObject(origins,flatmates)
  const averageCommuteTime = originsToDestinationsObject[Object.keys(originsToDestinationsObject)[0]].combinedDuration / flatmates.length
  return averageCommuteTime
}