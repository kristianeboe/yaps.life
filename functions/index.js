const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const createUserData = require('./createUserData')
var uuid = require('uuid')

admin.initializeApp(functions.config().firebase)

exports.populateDatabaseWithTestUsersHTTPS = functions.https.onRequest((req, res) => {
  let nrOfTestUsers = 100
  if (req.body.nrOfTestUsers) {
    nrOfTestUsers = req.body.nrOfTestUsers
  }
  const testUsers = createUserData.createUsers(nrOfTestUsers)

  // Everything is ok

  return Promise.all(
    testUsers.map(testUser => {
      admin
        .firestore()
        .collection('testUsers')
        .doc(testUser.uid)
        .set(testUser).catch(err => console.log("LOG: Error adding test user", err))
    })
  ).then(results => {
    console.log('LOG: ' + testUsers.length + ' Test users created')
    res.status(200).end()
  }).catch(err => console.log('ERROR: Error in creating users', err))
})

exports.countTestUsers = functions.https.onRequest((req, res) => {
  return admin.firestore().collection('testUsers').get().then(snapshot => {
    console.log('LOG: ' + snapshot.size)
  }).then(() => res.status(200).end())
})

exports.getTestUsersReadyToMatch = functions.https.onRequest((req, res) => {
  return admin.firestore().collection('testUsers').get().then(snapshot => {
    snapshot.forEach( doc => doc.ref.update({readyToMatch: true}) )
  })
})

exports.aggregateMatchInfo = functions.https.onRequest((req, res) => {
  let aggregateInfoObject = {}
  const matchSimilarityScores = []
  const matchSizes = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }
  let matchCounter = 0
  let matchesWithBestOrigins = 0
  let numberOfUsersCounted = 0
  let customMatchCounter = 0
  admin
    .firestore()
    .collection('matches')
    .get()
    .then(snapshot => {
      snapshot.forEach(matchDoc => {
        matchCounter += 1
        const match = matchDoc.data()
        const numberOfFlatmates = match.flatMates.length
        numberOfUsersCounted += numberOfFlatmates
        matchSizes[numberOfFlatmates] = matchSizes[numberOfFlatmates] + 1
        if (match.custom) {
          customMatchCounter += 1
        }
        if (numberOfFlatmates > 2) {
          matchSimilarityScores.push(match.flatAverageScore)
        }
        if (match.bestOrigin.length > 0 && match.bestOrigin !== 'Could not determine') {
          matchesWithBestOrigins += 1
        }
      })
    })
    .then(() => {
      const averageScore = matchSimilarityScores.reduce((a, b) => a + b, 0) / matchSimilarityScores.length
      let ratioOfPeopleIn3or4or5Flats = (matchSizes[3] * 3 + matchSizes[4] * 4 + matchSizes[5] * 5) / numberOfUsersCounted
      let ratioOfPeopleInSingels = matchSizes[1] / numberOfUsersCounted
      aggregateInfoObject = {
        averageScore,
        matchSizes,
        matchCounter,
        matchesWithBestOrigins,
        numberOfUsersCounted,
        ratioOfPeopleIn3or4or5Flats,
        ratioOfPeopleInSingels,
        customMatchCounter,
      }
      console.log(aggregateInfoObject)
      res.status(200).end()
    })
    .catch(err => console.log('Error in aggregating database info', err))
  return true
})

exports.getMatchedByCluster = functions.https.onRequest((req, res) => {
  console.log(req.body)
  // const userData = event.data.data()
  const readyToMatch = req.body.readyToMatch

  matchAllAvailableUsers()
  if (readyToMatch) {
  }
  res.status(200).end()
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
      console.log('got ' + users.length + ' users')
      return users
    })
    .then(users => {
      console.log('getting Kristians')

      const usersRef = admin.firestore().collection('users')
      return Promise.all([
        usersRef.doc('PmzsNVCnUSMVSMu2WGRa4omxez52').get(),
      ])
        .then(results => {
          results.forEach(doc => {
            userData = doc.data()
            users.push(userData)
          })
          return users
        })
        .catch(err => err)
    })
    .then(users => {
      console.log(users.length)
      console.log('starting clustering')
      return createUserData.cluster(users, true)
    })
    .then(clusters => {
      console.log('Organizing into flats')
      const flatmates = createUserData.flatMatesFromClusters(clusters, 4)
      console.log('flatmates length', flatmates.length)
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

        let flatAverageScore = 100
        if (simScores.length > 1) {
          flatAverageScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
        }

        const match = {
          uid: uuid(),
          flatMates: flat,
          location: 'Oslo',
          bestOrigin: '',
          flatAverageScore,
          custom: false,
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
                dateTime: admin.firestore.FieldValue.serverTimestamp(),
                from: {
                  uid: 'hWBbCxiigfUISnJ8upb6pnUDfXG3',
                  displayName: 'Admin',
                  photoURL:
                    'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg',
                },
              })
              .catch(err => console.log('error adding original message to match', err))
          })
          .catch(err => console.log('error with creating match', err)) //.then(doc => doc.ref.collection('messages').add({})
        match.flatMates.forEach(mate => {
          let collectionName = 'testUsers'
          if (mate.uid === 'PmzsNVCnUSMVSMu2WGRa4omxez52' || mate.uid === 's4re9rrIFwfH3NfXh13A2HQeHuQ2') {
            collectionName = 'users'
          }
          admin
            .firestore()
            .collection(collectionName)
            .doc(mate.uid)
            .update({ currentMatchId: match.uid, readyToMatch: false, newMatch: true })
            .catch(err => console.log('error with updating user with currentMatchId', err))
        })
      })
      return 'Operation complete'
    })
    .catch(error => console.log('Error in creating matches', error))
}

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

exports.onMatchCreate = functions.firestore.document('matches/{matchId}').onCreate(event => {
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
  console.log('LOG: Event data data()', event.data.data())
  const match = event.data.data()

  if (!match) {
    console.log('LOG: No match provided to get best origin for')
    return 'No match provided to get best origin for'
  }

  if (match.flatMates.length < 3) {
    return "Not enough people to do a location match"
  }

  return getBestOriginFromMatch(match)
})

exports.getBestOriginHTTPforMatch = functions.https.onRequest((req, res) => {
  const matchId = req.body.matchId

  return admin.firestore().collection('matches').doc(matchId).get().then(matchDoc => getBestOriginFromMatch(matchDoc.data()))
})
getBestOriginFromMatch = (match) => {
  const origin1 = 'Holmenkollen Oslo'
  const origin2 = 'Nydalen Oslo'
  const origin3 = 'Grunerløkka Oslo'

  // let origins = [origin1, origin2, origin3].map(origin => encodeURI(origin))
  const originsOslo = [
    'Sandvika Oslo',
    'Skøyen, Oslo',
    'Bekkelaget Oslo',
    'Røa Oslo',
    'Sogn Oslo',
    'Bjerke Oslo',
    'Ekeberg Oslo',
    'Sentrum Oslo',
    'Majorstuen Oslo',
    'Grünerløkka Oslo',
    'Gamle Oslo',
    'Frogner Oslo',
  ]
  const originsOsloSmall1 = [
    'Grunerløkka Oslo', //Grunerløkka - Sofienberg
    'Majorstuen Oslo', // Majorstuen, Uranienborg, Nationaltheateret
    'Fronger Oslo',
    'Gamle Oslo',
  ]
  const originsOsloSmall = {
    'Grunerløkka Oslo': 'location=1.20061.20511&', //Grunerløkka - Sofienberg
    'Majorstuen Oslo': 'location=1.20061.20508&', // Majorstuen, Uranienborg, Nationaltheateret
    'Fronger Oslo': 'location=1.20061.20507&',
    'Gamle Oslo': 'location=1.20061.20512&',
  }
  const origins = Object.keys(originsOsloSmall).map(origin => encodeURI(origin))
  const destinations = match.flatMates.map(mate => encodeURI(mate.workplace))

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
    let bestOrigin = ''
    if (data.status == 'OK') {
      const origins = data.origin_addresses
      const destinations = data.destination_addresses

      let originsToDestinationsObject = {}


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

    }

    // console.log(originsToDestinationsObject)
    // console.log(bestOrigin)

    const nrOfFlatmates = match.flatMates.length

    const finnQueryStem = "https://www.finn.no/realestate/lettings/search.html?"
    const locationConstraintCity = match.location.toLowerCase() == 'oslo' ? "location=0.20061&" : ''
    const locationConstraintNeighbourhood = (bestOrigin.length > 0 && bestOrigin !== 'Could not determine') ? originsOsloSmall[bestOrigin] : ''
    const nrOfBedroomsFrom = "no_of_bedrooms_from=" + nrOfFlatmates + "&"
    const propertyTypes = "property_type=1&property_type=3&property_type=4&property_type=2"

    const finnQueryString = finnQueryStem + locationConstraintCity + locationConstraintNeighbourhood + nrOfBedroomsFrom + propertyTypes
    const airBnBQuery = "https://www.airbnb.com/s/Oslo--Norway/homes?place_id=ChIJOfBn8mFuQUYRmh4j019gkn4&query=Oslo%2C%20Norway&refinement_paths%5B%5D=%2Fhomes&allow_override%5B%5D=" +
      "&adults=" + nrOfFlatmates +
      "&min_beds=" + nrOfFlatmates +
      "&min_bedrooms=" + nrOfFlatmates +
      "&s_tag=2D91el1z"

    admin
      .firestore()
      .collection('matches')
      .doc(match.uid)
      .update({ bestOrigin, finnQueryString })
  })
  return bestOrigin
}

exports.deleteMatchClusterCollection = functions.https.onRequest((req, res) => {
  const batchSize = 100
  const db = admin.firestore()
  var collectionRef = admin.firestore().collection('matches');
  var query = collectionRef.where("custom", "==", false).orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
})

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size == 0) {
        return 0;
      }

      // Delete documents in a batch
      var batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    }).then((numDeleted) => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
      });
    })
    .catch(reject);
}
