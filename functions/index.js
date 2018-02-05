const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios')

admin.initializeApp(functions.config().firebase)

exports.createUser = functions.auth.user().onCreate(event => {

  const user =
    {
      displayName: event.data.displayName,
      email: event.data.email,
      uid: event.data.uid,
      photoURL: event.data.photoURL,
    }
  const userCollectionRef = admin.firestore().collection('users');
  return userCollectionRef.doc(event.data.uid).set(user).then(() => {
    console.log('User added successfully', user)
    return true
  }).catch((error) => {
    console.log("Error", error)
    return false
  })

});


exports.postProcessingUserTrigger = functions.firestore.document('users/{userId}').onUpdate((event) => {

  const userRef = event.data.ref
  const userId = event.data.ref.id
  const userData = event.data.data()

  console.log('data', event.data)
  console.log('userRef', userRef)
  console.log('userId', userId)
  console.log('userData', userData)

  return postProcessingUser(userId, userData, userRef)

});

function postProcessingUser(userId, userData, userRef) {

  getMachScores(userId, userData).then((matchScores) => {
    console.log('matchscores', matchScores)
    return Object.keys(matchScores).reduce((a, b) => matchScores[a] > matchScores[b] ? a : b);
  }).then((bestMatchId) => {
    return googleMapsDistance(userData.workplace, bestMatchId)
  }).then((bestOrigin) => {
    userRef.collection('roommates').add({
      matches: matchScores,
      bestMatchId: bestMatchId,
      bestOrigin: bestOrigin,
    })
  }).catch((error) => {
    console.log(error)
  })


  // // get matchScores
  // const matchScores = await getMachScores(userId, userData)

  // // get bestMatchId
  // const bestMatchId = Object.keys(matchScores).reduce((a, b) => matchScores[a] > matchScores[b] ? a : b);

  // // get bestOrigin
  // const bestOrigin = await googleMapsDistance(userData.workplace, bestMatchId)

  // // update database

  // userRef.collection('roommates').add({
  //   matches: matchScores,
  //   bestMatchId: bestMatchId,
  //   bestOrigin: bestOrigin,
  // })



}

function getMachScores(userId, userData) {
  return new Promise((resolve, reject) => {
    console.log('made it inside promise 1')
    let matchScores = {}

    admin.firestore().collection("users").get().then((querySnapshot) => {
      querySnapshot.forEach((user) => {
        if (userId != user.id) {
          matchScores[user.id] = match(userData, user.data())
        }
      });
      resolve(matchScores)
    }).catch((error) => {
      console.log('Trouble getting matchScores', error)
    })
  })
}




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


function googleMapsDistance(userWorkplace, bestMatchId) {

  const origin1 = 'Arnebråtveien 75D Oslo'
  const origin2 = 'Nydalen Oslo'
  const origin3 = 'Grunerløkka Oslo'


  let origins = [origin1, origin2, origin3].map((origin) => encodeURI(origin))
  let destinations = [encodeURI(userWorkplace)]
  bestMatchUserWorkplace = await admin.firestore().collection("users").doc(bestMatchId).get().then((doc) => {
    return doc.data().workplace
  })
  destinations.push(encodeURI(bestMatchUserWorkplace))

  const mode = 'transit'

  // const nextMondayAt8 = getNextDayOfWeek(new Date(), 1).getTime()

  // '&departure_time=' + nextMondayAt8
  let requestUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origins.join('|') + '&destinations=' + destinations.join('|') + '&mode=' + mode + '&key=' + 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

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

}

function getBestOrigin(originsToDestinations) {
  console.log('inside', originsToDestinations)

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

