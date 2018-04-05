const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })
const createUserData = require('./utils/createUserData')
const clusteringPipeline = require('./clusteringAlgorithms/clusteringPipeline')
const locationAlgorithms = require('./location/locationAlgorithms')
const { deleteMatchClusterCollection } = require('./utils/dbCleanupFunctions')

admin.initializeApp(functions.config().firebase)

exports.populateDatabaseWithTestUsersHTTPS = functions.https.onRequest((req, res) => {
  let { nrOfTestUsers } = req.body

  if (!nrOfTestUsers) {
    nrOfTestUsers = 100
  }
  const testUsers = createUserData.createTestUsers(nrOfTestUsers)

  return Promise.all(testUsers.map(testUser =>
    admin
      .firestore()
      .collection('testUsers')
      .doc(testUser.uid)
      .set(testUser)
      .catch(err => console.log('LOG: Error adding test user', err))))
    .then(() => {
      console.log(`LOG: ${testUsers.length} Test users created`)
      res.status(200).end()
    })
    .catch(err => console.log('ERROR: Error in creating test users', err))
})

exports.countTestUsers = functions.https.onRequest((req, res) =>
  admin
    .firestore()
    .collection('testUsers')
    .get()
    .then((snapshot) => {
      console.log(`LOG: ${snapshot.size} test users found`)
    })
    .then(() => res.status(200).end())
    .catch(err => res.status(500).send(err)))

exports.setTestUsersReadyToMatch = functions.https.onRequest((req, res) =>
  admin
    .firestore()
    .collection('testUsers')
    .get()
    .then((snapshot) => {
      snapshot.forEach(doc => doc.ref.update({ readyToMatch: true, currentMatches: {} }))
      console.log(`${snapshot.size} test users ready to match`)
      res.status(200).end()
    })
    .catch(err => res.status(500).send(err)))

exports.resetDatabase = functions.https.onRequest((req, res) => {
  this.setTestUsersReadyToMatch(req, res)
  admin
    .firestore()
    .collection('users')
    .get()
    .then((snapshot) => {
      snapshot.forEach(doc => doc.ref.update({ readyToMatch: true, currentMatches: {} }))
      console.log(`${snapshot.size} real users updated`)
    })
  deleteMatchClusterCollection().then(() => {
    res.status(200).end()
  }).catch(err => console.log(err) || res.status(500).send(err))
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
  }
  let matchCounter = 0
  let matchesWithBestOrigins = 0
  let numberOfUsersCounted = 0
  let customMatchCounter = 0
  admin
    .firestore()
    .collection('matches')
    .get()
    .then((snapshot) => {
      snapshot.forEach((matchDoc) => {
        matchCounter += 1
        const match = matchDoc.data()
        const numberOfFlatmates = match.flatmates.length
        numberOfUsersCounted += numberOfFlatmates
        matchSizes[numberOfFlatmates] += 1
        if (match.custom) {
          customMatchCounter += 1
        }
        if (numberOfFlatmates > 2) {
          matchSimilarityScores.push(match.flatScore)
        }
        if (
          match.bestOrigin.length > 0 &&
          match.bestOrigin !== 'Could not determine'
        ) {
          matchesWithBestOrigins += 1
        }
      })
    })
    .then(() => {
      const averageScore =
        matchSimilarityScores.reduce((a, b) => a + b, 0) /
        matchSimilarityScores.length
      const ratioOfPeopleIn3or4or5Flats =
        (matchSizes[3] * 3 + matchSizes[4] * 4 + matchSizes[5] * 5) /
        numberOfUsersCounted
      const ratioOfPeopleLessThan3 = (matchSizes[1] + matchSizes[2] * 2) / numberOfUsersCounted
      aggregateInfoObject = {
        averageScore,
        matchSizes,
        matchCounter,
        matchesWithBestOrigins,
        numberOfUsersCounted,
        ratioOfPeopleIn3or4or5Flats,
        ratioOfPeopleLessThan3,
        customMatchCounter
      }
      console.log(aggregateInfoObject)
      res.status(200).end()
    })
    .catch(err => console.log('Error in aggregating database info', err))
  return true
})

exports.getMatchedByCluster = functions.https.onRequest((req, res) => {
  // const userData = event.data.data()
  // const { readyToMatch } = req.body

  clusteringPipeline.matchAllAvailableUsers()
  res.status(200).end()
})

exports.onMatchCreate = functions.firestore
  .document('matches/{matchId}')
  .onCreate((event) => {
    const match = event.data.data()

    if (!match) {
      console.log('LOG: No match provided to get best origin for')
      return 'No match provided to get best origin for'
    }

    if (match.flatmates.length < 3) {
      console.log('LOG: Not enough people to do a location cluster match')
      return 'Not enough people to do a location cluster match'
    }

    return locationAlgorithms.getBestOriginForMatch(match)
  })

exports.getBestOriginHTTPforMatch = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { matchId } = req.body

    return admin
      .firestore()
      .collection('matches')
      .doc(matchId)
      .get()
      .then(matchDoc => locationAlgorithms.getBestOriginForMatch(matchDoc.data()))
      .then(() => res.status(200).end())
      .catch(err => console.error(err))
  })
})

exports.scoreApartment = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // curl -H 'Content-Type: application/json' -d '{"address": "Nydalen Oslo", "flatmates": [{"workplace":"Netlight Oslo"}, {"workplace":"Capra Consulting Oslo"}]}' https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment
    console.log(req.body)
    const { address, flatmates } = req.body
    console.log(address, flatmates)

    if (!address || !flatmates) {
      res.status(400).end()
    }
    const origins = [address]
    locationAlgorithms.getOriginsToDestinationsObject(
      origins,
      flatmates
    ).then((originsToDestinationsObject) => {
      console.log(originsToDestinationsObject)
      const score = originsToDestinationsObject[Object.keys(originsToDestinationsObject)[0]].combinedDuration
      res.status(200).send({ score })
    }).catch((err) => {
      console.log('Error in scoring apartment', err)
      res.status(300).end()
    })
  })
})

exports.updateUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    admin.firestore().collection('users').doc('4spel7y5oJg0OarPxcHxhdwkgPF2').get()
      .then((doc) => {
        const data = doc.data()
        const answerVector = []
        for (let index = 0; index < 20; index += 1) {
          const answer = data[`q${index + 1}`]
          answerVector.push(answer)
        }
        doc.ref.update({ answerVector })
      })
      .then(() => {
        console.log('User updated')
        res.status(200).end()
      })
      .catch((err) => {
        console.log('Error in updating user', err)
        res.status(300).end()
      })
  })
})

