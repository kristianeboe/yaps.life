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
  let updateObject = {}
  return getMachScores(userId, userData).then((matchScores) => {
    console.log('matchscores', matchScores)
    updateObject.matchScores = matchScores
    const bestMatchId = Object.keys(matchScores).reduce((a, b) => matchScores[a] > matchScores[b] ? a : b);
    console.log('bestMatchId fresh', bestMatchId)
    updateObject.bestMatchId = bestMatchId
    return bestMatchId
  }).then((bestMatchId) => {
    console.log('bestMatchId inside next promise', bestMatchId)
    console.log('userData inside promise', userData)
    return googleMapsDistance(userData.workplace, bestMatchId)
    // googleMapsDistance(roommates)
  }).then((bestOrigin) => {
    console.log('bestOrigin', bestOrigin)
    // userRef.collection('roommates').add({
    //   matches: updateObject.matchScores,
    //   bestMatchId: updateObject.bestMatchId,
    //   bestOrigin: bestOrigin,
    // })
    userRef.update({
      match: {
        roommates: [updateObject.bestMatchId, ],
        bestOrigin,
        matches: updateObject.matchScores,
      }
    })
  }).catch((error) => {
    console.log(error)
  })

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
      reject(error)
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
  return new Promise((resolve, reject) => {
    const origin1 = 'Arnebråtveien 75D Oslo'
    const origin2 = 'Nydalen Oslo'
    const origin3 = 'Grunerløkka Oslo'


    let origins = [origin1, origin2, origin3].map((origin) => encodeURI(origin))
    let userWorkplaceWithoutSpaces = userWorkplace.replace(/,/g, " ");
    let destinations = [encodeURI(userWorkplaceWithoutSpaces)]

    console.log('destinations before', destinations)
    admin.firestore().collection("users").doc(bestMatchId).get().then((doc) => {
      return doc.data().workplace
    }).then((bestMatchUserWorkplace) => {
      let bestMatchUserWorkplaceWithoutSpaces = bestMatchUserWorkplace.replace(/,/g, " ")
      destinations.push(encodeURI(bestMatchUserWorkplaceWithoutSpaces))
      console.log('destinations after', destinations)
      console.log('destinations join', destinations.join('|'))
      const mode = 'transit'

      // const nextMondayAt8 = getNextDayOfWeek(new Date(), 1).getTime()

      // '&departure_time=' + nextMondayAt8
      let requestUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + origins.join('|') + '&destinations=' + destinations.join('|') + '&mode=' + mode + '&key=' + 'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'

      axios.get(requestUrl).then((response) => {

        console.log(response.data)
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

        resolve(bestOrigin)

      }).catch((error) => {
        console.log("error in axios and data parsing", error)
        reject(error)
      })

    })


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

