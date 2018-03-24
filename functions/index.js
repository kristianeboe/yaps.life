const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const createUserData = require('./createUserData')
var uuid = require('uuid')

admin.initializeApp(functions.config().firebase)

calculateSimScore = (uData, vData) => {
  const u = []
  const v = []

  for (let q = 0; q < 20; q++) {
    u.push(uData['q' + (q + 1)])
    v.push(vData['q' + (q + 1)])
  }
  const mag_u = Math.sqrt(u.map(el => el * el).reduce((a, b) => a + b, 0))
  const mag_v = Math.sqrt(v.map(el => el * el).reduce((a, b) => a + b, 0))
  const sum_vector = []
  for (let index = 0; index < u.length; index++) {
    const ui = u[index]
    const vi = v[index]
    sum_vector.push(ui * vi)
  }
  const dot_sum = sum_vector.reduce((a, b) => a + b, 0)

  return Math.floor(dot_sum / (mag_u * mag_v) * 100)
}

allToAllCosineSimilarity = () => {
  const matchSimilarityScore = []
  admin
    .firestore()
    .collection('matches')
    .get()
    .then(snapshot => {
      snapshot.forEach(matchDoc => {
        matchSimilarityScore.push(match.data().flatAverageScore)
      })
    })
  const averageScore = matchSimilarityScore.reduce((a, b) => a + b, 0) / matchSimilarityScore.length
  return averageScore
}

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
  for (const origin in originsToDestinations) {
    let combinedDuration = 0
    const destinations = originsToDestinations[origin]
    destinations.forEach(destination => {
      combinedDuration += destination.duration.value
    })
    originsToDestinations[origin].combinedDuration = combinedDuration
  }
  // console.log('inside', originsToDestinations)

  const bestOrigin = Object.keys(originsToDestinations).reduce(
    (a, b) => (originsToDestinations[a].combinedDuration < originsToDestinations[b].combinedDuration ? a : b)
  )
  console.log(bestOrigin)
  return bestOrigin
}

function getNextDayOfWeek(date, dayOfWeek) {
  // Code to check that date and dayOfWeek are valid left as an exercise ;)
  date.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7)
  date.setHours(8, 0, 0)
  return date
}

exports.onNewMatch = functions.firestore.document('matches/{match}').onCreate(event => {
  // const match = {
  //   flatmates: event.data.flatmates,
  //   flat: event.data.flat,
  //   matchId: event.data.uid,
  // }

  // const user1 = createUserData.user1
  // const user2 = createUserData.user2
  // const user3 = createUserData.user3
  // const me = createUserData.me

  // const match = {
  //   flatmates: [me.uid, user1.uid, user2.uid, user3.uid],
  //   flat: [me, user1, user2, user3],
  //   matchId: me.currentMatchId,
  // }

  const match = event.data.data()

  if (!match) {
    return "No match provided to get best origin for"
  }

  const origin1 = 'Holmenkollen Oslo'
  const origin2 = 'Nydalen Oslo'
  const origin3 = 'Grunerløkka Oslo'

  // let origins = [origin1, origin2, origin3].map(origin => encodeURI(origin))
  const origins = [
    'Alna Oslo',
    'Bjerke Oslo',
    'Frogner Oslo',
    'Gamle Oslo Oslo',
    'Grorud Oslo',
    'Grünerløkka Oslo',
    'Nordre Aker Oslo',
    'Nordstrand Oslo',
    'Sagene Oslo',
    'St. Hanshaugen Oslo',
    'Stovner Oslo',
    'Søndre Nordstrand Oslo',
    'Ullern Oslo',
    'Vestre Aker Oslo',
    'Østensjø Oslo',
  ].map(origin => encodeURI(origin))
  console.log(origins)
  const destinations = match.flatMates.map(mate => encodeURI(mate.workplace))
  console.log(destinations)

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

  console.log(requestUrl)

  return axios(requestUrl).then(response => {
    console.log(response.data)
    const data = response.data

    const origins = data.origin_addresses
    const destinations = data.destination_addresses

    let originsToDestinationsObject = {}
    let bestOrigin = ''

    // for (const origin of data.rows) {
    //   for (const destination of origin.elements) {
    //     console.log(destination)
    //   }
    // }

    try {
      for (let i = 0; i < origins.length; i++) {
        var results = data.rows[i].elements
        var from = origins[i]
        originsToDestinationsObject[from] = []
        for (let j = 0; j < results.length; j++) {
          var element = results[j]
          var status = element.status
          var distance = element.distance
          var duration = element.duration
          var to = destinations[j]
          // console.log(from, to, duration.value)
          originsToDestinationsObject[from].push({
            to,
            status,
            distance: status == 'OK' ? distance : '',
            duration: status == 'OK' ? duration : '',
          })
          // originsToDestinationsObject[from] = [...originsToDestinationsObject[from], {to, duration:duration.value} ]
        }
      }
      bestOrigin = getBestOrigin(originsToDestinationsObject)
    } catch (error) {
      console.log(error)
      bestOrigin = 'Could not determine'
    }

    // console.log(originsToDestinationsObject)
    // console.log(bestOrigin)

    admin
      .firestore()
      .collection('matches')
      .doc(match.matchId)
      .update({ location: bestOrigin })
  })
  return bestOrigin
})

exports.getMatched = functions.firestore.document('users/{user}').onUpdate(event => {
  matchAllAvailableUsers()
  // const userData = event.data.data()
  // if (userData.readyToMatch) {
  // }
})

exports.populateDatabaseWithTestUsers = functions.https.onRequest((req, res) => {
  const testUsers = createUserData.createUsers(199)

  Promise.all(
    testUsers.map(testUser => {
      admin
        .firestore()
        .collection('testUsers')
        .doc(testUser.uid)
        .set(testUser)
    })
  ).then(results => console.log(testUsers.length + ' Test users created'))
})

matchAllAvailableUsers = () => {
  const users = []
  admin
    .firestore()
    .collection('testUsers')
    .where('matchLocation', '==', 'Oslo')
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
      console.log('getting Kristians')
      return new Promise((resolve, reject) => {
        const usersRef = admin.firestore().collection('users')
        Promise.all([
          usersRef.doc('hWBbCxiigfUISnJ8upb6pnUDfXG3').get(),
          usersRef.doc('s4re9rrIFwfH3NfXh13A2HQeHuQ2').get(),
        ])
          .then(results => {
            results.forEach(doc => {
              userData = doc.data()
              users.push(userData)
            })
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
        const simScores = []
        for (let i = 0; i < flat.length; i++) {
          const mate1 = flat[i]
          for (let j = 0; j < flat.length; j++) {
            const mate2 = flat[j]
            if (i !== j) {
              simScore = calculateSimScore(mate1, mate2)
              simScores.push(simScore)
            }
          }
        }

        const flatAverageScore = simScores.reduce((a, b) => a + b, 0) / simScores.length

        const match = {
          uid: uuid(),
          flatMates: flat,
          location: 'Oslo',
          bestOrigin: '',
          flatAverageScore,
        }
        admin
          .firestore()
          .collection('matches')
          .doc(match.uid)
          .set(match)
          .then(() => {
            admin
              .firestore()
              .collection('matches')
              .doc(match.uid)
              .collection('messages')
              .add({
                text: 'Stay civil in the chat guys',
                dateTime: Date.now(),
                from: {
                  uid: 'hWBbCxiigfUISnJ8upb6pnUDfXG3',
                  displayName: 'Admin',
                  photoURL:
                    'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg',
                },
              })
          })
          .catch(err => console.log('error with creating match', err)) //.then(doc => doc.ref.collection('messages').add({})
        match.flatMates.forEach(mate => {
          const collectionName = mate.uid == 'hWBbCxiigfUISnJ8upb6pnUDfXG3' ? 'users' : 'testUsers'
          admin
            .firestore()
            .collection(collectionName)
            .doc(mate.uid)
            .update({ currentMatchId: match.uid, readyToMatch: false, seeNewUsers: true })
            .catch(err => console.log('error with updating user with currentMatchId', err))
        })
      })
      return 'Operation complete'
    })
    .catch(error => console.log('Error in creating matches', error))
}
