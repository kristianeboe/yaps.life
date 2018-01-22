// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
});


const origin1 = 'Arnebråtveien 75D Oslo'
const origin2 = 'Nydalen Oslo'
const origin3 = 'Grunerløkka Oslo'
const destination1 = 'Netlight AS'
const destination2 = 'Google Norge'
const destination3 = 'Professor Kohts Vei 9, 1366 Lysaker, Norge'

const origins = [origin1, origin2, origin3]
const destinations = [destination1, destination2, destination3]

const nextMondayAt8 = getNextDayOfWeek(new Date(), 1)


googleMapsClient.distanceMatrix({
  origins: [
    origin1, origin2, origin3
  ],
  destinations: [
    destination1, destination2, destination3
  ],
  mode: 'transit',
  arrival_time: nextMondayAt8,
}, function (err, response) {

  if (!err) {
    const data = response.json

    console.log(response)

    const origins = data.origin_addresses;
    const destinations = data.destination_addresses;

    let address_ratings = {}

    for (let i = 0; i < origins.length; i++) {
      var results = data.rows[i].elements;
      for (let j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance.text;
        var duration = element.duration.value;
        var from = origins[i];
        var to = destinations[j];

        // console.log('lol', address_ratings)
        if (address_ratings[from]) {
          address_ratings[from] = address_ratings[from] + (duration/results.length)
        }
        else {
          address_ratings[from] = duration/results.length
        }
      }
    }

    console.log(address_ratings)

    best_rating = 3600
    best_address = ''
    for (address in address_ratings) {
      if (address_ratings[address] < best_rating) {
        best_rating = address_ratings[address]
        best_address = address
      }
    }

    if (best_rating >= 3600) {
      return 'All these addresses are more than an hour away'
    }

    console.log('best_address', best_address, best_rating)
    return best_address


  } else {
    console.log('Err distancematrix', err)
  }

});

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  date.setHours(8, 0, 0)
  return date;
}
