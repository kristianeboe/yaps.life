const functions = require('firebase-functions');
const admin = require('firebase-admin');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
});

const request = require('request')
const axios = require('axios')

admin.initializeApp(functions.config().firebase)

exports.googleMapsDistance = functions.firestore.document('users/{userId}').onCreate(event => {
  console.log('I am new again')

  const googleMapsAPIkey = 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

  const origin1 = ('Arnebråtveien 75D Oslo')
  const origin2 = ('Nydalen Oslo')
  const origin3 = ('Grunerløkka Oslo')
  const destination1 = ('Netlight AS')
  const destination2 = ('Google Norge')
  const destination3 = ('Professor Kohts Vei 9, 1366 Lysaker, Norge')

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
      
      const origins = data.origin_addresses;
      const destinations = data.destination_addresses;

      for (let i = 0; i < origins.length; i++) {
        var results = data.rows[i].elements;
        for (let j = 0; j < results.length; j++) {
          var element = results[j];
          var distance = element.distance.text;
          var duration = element.duration.text;
          var from = origins[i];
          var to = destinations[j];
          console.log('Duration', from, to, duration)
        }
      }

    } else {
      console.log('Err distancematrix', err)
    }

  });
})

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  date.setHours(8, 0, 0)
  return date;
}
