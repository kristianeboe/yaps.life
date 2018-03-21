const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const createUserData = require('./createUserData')
var uuid = require('uuid')

admin.initializeApp(functions.config().firebase)

// exports.createUser = functions.auth.user().onCreate(event => {
//   const user = {
//     displayName: event.data.displayName,
//     email: event.data.email,
//     uid: event.data.uid,
//     photoURL: event.data.photoURL,
//   }
//   const userCollectionRef = admin.firestore().collection('users')
//   return userCollectionRef
//     .doc(event.data.uid)
//     .set(user)
//     .then(() => {
//       console.log('User added successfully', user)
//       return true
//     })
//     .catch(error => {
//       console.log('Error', error)
//       return false
//     })
// })

// exports.postProcessingUserTrigger = functions.firestore.document('/{userId}').onUpdate(event => {
//   const userRef = event.data.ref
//   const userId = event.data.ref.id
//   const userData = event.data.data()

//   console.log('data', event.data)
//   console.log('userRef', userRef)
//   console.log('userId', userId)
//   console.log('userData', userData)

//   return postProcessingUser(userId, userData, userRef)
// })

function postProcessingUser(userId, userData, userRef) {
  let updateObject = {}
  return getMachScores(userId, userData)
    .then(matchScores => {
      matchScores.sort((a, b) => a.score - b.score)
      top3 = matchScores.slice(0, 3)
      updateObject.matchScores = matchScores
      updateObject.top3 = top3
      const bestMatchId = Object.keys(matchScores).reduce((a, b) => (matchScores[a] > matchScores[b] ? a : b))
      return top3
    })
    .then(top3 => {
      return googleMapsDistance(userData.workplace, top3)
      // googleMapsDistance(roommates)
    })
    .then(bestOrigin => {
      console.log('bestOrigin', bestOrigin)
      // userRef.collection('roommates').add({
      //   matches: updateObject.matchScores,
      //   bestMatchId: updateObject.bestMatchId,
      //   bestOrigin: bestOrigin,
      // })
      console.log('updateObject', updateObject)
      userRef.update({
        match: {
          roommates: updateObject.top3,
          bestOrigin,
          matches: updateObject.matchScores,
          top3: updateObject.top3,
        },
      })
    })
    .catch(error => {
      console.log(error)
    })
}

function getMachScores(userId, userData) {
  return new Promise((resolve, reject) => {
    console.log('made it inside promise 1')
    let matchScores = []

    admin
      .firestore()
      .collection('users')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(user => {
          if (userId != user.id) {
            matchScores.push({
              userId: user.id,
              score: match(userData, user.data()),
            })
          }
        })
        resolve(matchScores)
      })
      .catch(error => {
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

function googleMapsDistance(userWorkplace, top3) {
  return new Promise((resolve, reject) => {
    const origin1 = 'Arnebråtveien 75D Oslo'
    const origin2 = 'Nydalen Oslo'
    const origin3 = 'Grunerløkka Oslo'

    let origins = [origin1, origin2, origin3].map(origin => encodeURI(origin))
    let userWorkplaceWithoutSpaces = userWorkplace.replace(/,/g, ' ')
    let destinations = [encodeURI(userWorkplaceWithoutSpaces)]
    console.log('top3', top3)
    console.log('destinations before', destinations)
    Promise.all(
      top3.map(user =>
        admin
          .firestore()
          .collection('users')
          .doc(user.userId)
          .get()
      )
    )
      .then(results => {
        results.map(doc => {
          const userWorkplace = doc.data().workplace
          const userWorkplaceWithoutSpaces = userWorkplace.replace(/,/g, ' ')
          destinations.push(encodeURI(userWorkplaceWithoutSpaces))
        })

        return destinations
      })
      .then(destinations => {
        console.log('destinations after', destinations)
        const mode = 'transit'

        // const nextMondayAt8 = getNextDayOfWeek(new Date(), 1).getTime()

        // '&departure_time=' + nextMondayAt8
        let requestUrl =
          'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' +
          origins.join('|') +
          '&destinations=' +
          destinations.join('|') +
          '&mode=' +
          mode +
          '&key=' +
          'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
        return requestUrl
      })
      .then(requestUrl => {
        axios
          .get(requestUrl)
          .then(response => {
            console.log(response.data)
            const data = response.data

            const origins = data.origin_addresses
            const destinations = data.destination_addresses

            let originsToDestinationsObject = {}
            let bestOrigin = ''
            try {
              for (let i = 0; i < origins.length; i++) {
                var results = data.rows[i].elements
                for (let j = 0; j < results.length; j++) {
                  var element = results[j]
                  var distance = element.distance
                  var duration = element.duration
                  var from = origins[i]
                  var to = destinations[j]
                  console.log(from, to, duration.value)
                  originsToDestinationsObject[from] = { [to]: duration.value }
                }
              }
              bestOrigin = getBestOrigin(originsToDestinationsObject)
            } catch (error) {
              bestOrigin = 'Could not determine'
            }

            console.log(originsToDestinationsObject)

            resolve(bestOrigin)
          })
          .catch(error => {
            console.log('error in axios and data parsing', error)
            reject(error)
          })
      })
      .catch(error => {
        console.log('error bestOrigin', error)
        reject(error)
      })
  })
}

function getBestOrigin(originsToDestinations) {
  console.log('inside', originsToDestinations)

  Object.keys(originsToDestinations).forEach(origin => {
    let combinedDuration = 0
    Object.keys(originsToDestinations[origin]).forEach(destination => {
      combinedDuration += originsToDestinations[origin][destination]
    })
    originsToDestinations[origin].combinedDuration = combinedDuration
  })

  const bestOrigin = Object.keys(originsToDestinations).reduce(
    (a, b) => (originsToDestinations[a.combinedDuration] > originsToDestinations[b.combinedDuration] ? a : b)
  )

  return bestOrigin
}

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7)
  date.setHours(8, 0, 0)
  return date
}

exports.postProcessingAllUsers = functions.firestore.document('test/{lol}').onCreate(event => {
  const testUsers = createUserData.createUsers(199)
  console.log('Created test users')
  return Promise.all(
    []
    // testUsers.map(testUser => {
    //   admin
    //     .firestore()
    //     .collection('testUsers')
    //     .doc(testUser.uid)
    //     .set(testUser)
    // })
  ).then(() => {
    const users = []
    return admin
      .firestore()
      .collection('testUsers')
      .where('readyToMatch', '==', true)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const user = doc.data()
          users.push(user)
          // postProcessingUser(doc.id, user, doc.ref)
        })
        console.log('got users')
        return users
      })
      .then(users => {
        console.log('getting Kristian')
        return new Promise((resolve, reject) => {
          admin
            .firestore()
            .collection('users')
            .doc('hWBbCxiigfUISnJ8upb6pnUDfXG3')
            .get()
            .then(doc => {
              userData = doc.data()
              users.push(userData)
              resolve(users)
            })
            .catch(err => reject(err))
        })
      })
      .then(users => {
        console.log('starting clustering')
        return createUserData.cluster(users, true)
      })
      .then(clusters => {
        console.log('Organizing into flats')
        const flatmates = createUserData.flatMatesFromClusters(clusters, 4)
        const flats = flatmates.map(flat => flat.map(id => users[id]))
        flats.forEach(flat => {
          const match = {
            uid: uuid(),
            flatMates: flat.map(mate => mate.uid),
            location: 'Oslo',
          }
          admin
            .firestore()
            .collection('matches')
            .doc(match.uid)
            .set(match)
            .catch(err => console.log('error with creating match', err)) //.then(doc => doc.ref.collection('messages').add({})
          match.flatMates.forEach(mate => {
            const collectionName = mate == 'hWBbCxiigfUISnJ8upb6pnUDfXG3' ? 'users' : 'testUsers'
            admin
              .firestore()
              .collection(collectionName)
              .doc(mate)
              .update({ currentMatchId: match.uid })
              .catch(err => console.log('error with updating user with currentMatchId', err))
          })
        })
        return 'Operation complete'
      })
  })

  // admin.firestore().collection('users').doc('VgWbJNFTyqRaanGoStkQWyUi4533').get().then(doc => {
  //   const user = doc.data()
  //   console.log('user', user)
  //   postProcessingUser(doc.id, user, doc.ref)
  // })
})
