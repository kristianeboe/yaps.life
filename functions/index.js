const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios')

admin.initializeApp(functions.config().firebase)


async function googleMapsDistance(userWorkplace, bestMatchId) {
  const origin1 = 'Arnebråtveien 75D Oslo'
  const origin2 = 'Nydalen Oslo'
  const origin3 = 'Grunerløkka Oslo'


  let origins = [ origin1, origin2, origin3].map((origin) => encodeURI(origin))
  let destinations = [encodeURI(userWorkplace)]
  bestMatchUserWorkplace = await admin.firestore().collection("users").doc(bestMatchId).get().then((doc) => {
    return doc.data().workplace
  })
  destinations.push(encodeURI(bestMatchUserWorkplace))

  const mode = 'transit'

  // const nextMondayAt8 = getNextDayOfWeek(new Date(), 1).getTime()

  // '&departure_time=' + nextMondayAt8
  let requestUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origins.join('|') + '&destinations=' + destinations.join('|') +'&mode=' + mode + '&key=' + 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

  return axios.get(requestUrl).then((response) => {

    // console.log(response)
    const data = response.data

    const origins = data.origin_addresses;
    const destinations = data.destination_addresses;

    let originsToDestinationsObject = {}

    for (let i = 0; i < origins.length; i++) {
      var results = data.rows[i].elements;
      for (let j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance;
        var duration = element.duration;
        var from = origins[i];
        var to = destinations[j];
        console.log(from, to, duration.value)
        originsToDestinationsObject[from] = { [to]: duration.value }
      }
    }

    const bestOrigin = getBestOrigin(originsToDestinationsObject)

    console.log(originsToDestinationsObject)

    return bestOrigin

  }).catch((error) => {
    console.log("FUCK!", error)
  })
  // bestMatchUser = admin.firestore().collection("users").doc(bestMatchId).get().then((doc) => {

  // destinations.concat(doc.data().workplace)



  // return new Promise((resolve, reject) => {
  //   googleMapsClient.distanceMatrix({
  //     origins: [
  //       origin1, origin2, origin3
  //     ],
  //     destinations: destinations,
  //     mode: 'transit',
  //     arrival_time: nextMondayAt8,
  //   }, function (err, response) {
  //     if (!err) {
  // const data = response.json

  // const origins = data.origin_addresses;
  // const destinations = data.destination_addresses;

  // let originsToDestinationsObject = {}

  // for (let i = 0; i < origins.length; i++) {
  //   var results = data.rows[i].elements;
  //   for (let j = 0; j < results.length; j++) {
  //     var element = results[j];
  //     var distance = element.distance.text;
  //     var duration = element.duration.text;
  //     var from = origins[i];
  //     var to = destinations[j];
  //     originsToDestinationsObject[from] = { to: duration.element.duration.value }
  //     console.log('Duration', from, to, duration)
  //   }
  // }

  // const bestOrigin = getBestOrigin(originsToDestinationsObject)

  // console.log(originsToDestinationsObject)
  // console.log('Best origin', bestOrigin)

  // return bestOrigin


  //     } else {
  //       console.log('Err distancematrix', err)
  //     }

  // })

  // });



  // }).catch((error) => {
  //   console.log(error)
  // })

  // console.log('event id', event.data.id)
  // console.log('event id', event.data.val())


  // admin.firestore().collection("users").doc(event.data.id).get().then((doc) => {
  //   if (doc.exists) {
  //     destinations.concat(doc.data().workplace)
  //   }
  // })
  // admin.firestore().collection("users").doc(Object.keys(event.data.val())[0]).get().then((doc) => {
  //   if (doc.exists) {
  //     destinations.concat(doc.data().workplace)
  //   }
  // })
  // admin.firestore().collection("users").doc(Object.keys(event.data.val())[1]).get().then((doc) => {
  //   if (doc.exists) {
  //     destinations.concat(doc.data().workplace)
  //   }
  // })

  // Promise.all(
  //   admin.firestore().collection("users").doc(event.data.id).get(),
  //   admin.firestore().collection("users").doc(Object.keys(event.data.val())[0]).get(),
  //   admin.firestore().collection("users").doc(Object.keys(event.data.val())[1]).get()
  // ).then((values) => {
  //   console.log('inside promise all')
  //   console.log('values', values)
  //   console.log('destinations', destinations)
  // })

  // console.log('outside', destinations)


}

function getBestOrigin(originsToDestinations) {
  console.log('inside', originsToDestinations)

  // let bestOrigin = ['', -1]
  Object.keys(originsToDestinations).forEach((origin) => {
    let combinedDuration = 0
    Object.keys(originsToDestinations[origin]).forEach((destination) => {
      combinedDuration += originsToDestinations[origin][destination]
    })
    originsToDestinations[origin].combinedDuration = combinedDuration
  })

  const bestOrigin = Object.keys(originsToDestinations).reduce((a, b) => originsToDestinations[a.combinedDuration] > originsToDestinations[b.combinedDuration] ? a : b);

  return bestOrigin
}

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  date.setHours(8, 0, 0)
  return date;
}

async function getMachScores(userId, userData) {
  let matchScores = {}

  return admin.firestore().collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((user) => {
      if (userId != user.id) {
        matchScores[user.id] = match(userData, user.data())
      }
    });
    return matchScores
  }).catch((error) => {
    console.log('Trouble getting matchScores', error)
  })
}

async function postProcessingUser(event) {

  // let matchScores = {}

  // let updateObject = {}

  const userId = event.data.ref.id
  const userData = event.data.data()

  // get matchScores
  const matchScores = await getMachScores(userId, userData)

  // get bestMatchId
  const bestMatchId = Object.keys(matchScores).reduce((a, b) => matchScores[a] > matchScores[b] ? a : b);
  console.log(userData.workplace, bestMatchId)

  const bestOrigin = await googleMapsDistance(userData.workplace, bestMatchId)

  console.log('Best origin oustide', bestOrigin)

  // console.log(bestOrigin)

  // get bestOrigin
  // update database

  // event.data.ref.update({
  //   matches: matchScores,
  //   bestMatchId: bestMatchId,
  //   bestOrigin: bestOrigin,
  // })


  return matchScores

}


exports.postProcessingUserTrigger = functions.firestore.document('users/{userId}').onCreate(event => {
  // Creating matches

  return postProcessingUser(event)
})




// // Populate match scores
// admin.firestore().collection("users").get().then((querySnapshot) => {
//   querySnapshot.forEach((user) => {
//     if (event.data.ref.id != user.id) {
//       matchScores[user.id] = match(event.data.data(), user.data())
//     }
//   });

//   const bestMatchId = Object.keys(matchScores).reduce((a, b) => matchScores[a] > matchScores[b] ? a : b);
//   const userWorkplace = event.data.data().workplace

//   updateObject.matchScores = matchScores
//   updateObject.bestMatchId = bestMatchId

// }).then(() => {
//   console.log(bestMatchId)
//   return yield googleMapsDistance(event.data.data().workplace, bestMatchId)

// }).then((bestOrigin) => {
//   event.data.ref.update({
//     matches: matchScores,
//     bestMatchId: updateObject.bestMatchId,
//     bestOrigin: bestOrigin,
//   })
// })
//   .catch((error) => {
//     console.log(error)
//   });
// })

function match(newUser, matchUser) {
  let matchScore = 0
  for (const field1 in newUser.field_of_work) {
    for (const field2 in matchUser.field_of_work) {
      if (field1 === field2) {
        matchScore = matchScore + 1
      }
    }
  }

  for (const field1 in newUser.preferences_apartment) {
    for (const field2 in matchUser.preferences_apartment) {
      if (field1 === field2) {
        matchScore = matchScore + 1
      }
    }
  }
  for (const field1 in newUser.preferences_roommates) {
    for (const field2 in matchUser.preferences_roommates) {
      if (field1 === field2) {
        matchScore = matchScore + 1
      }
    }
  }
  return matchScore
}