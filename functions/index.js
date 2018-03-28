const functions = require('firebase-functions')
const admin = require('firebase-admin')
const createUserData = require('./createUserData')
const clusteringAlgorithms = require('./clusteringAlgorithms')
const locationAlgorithms = require('./locationAlgorithms')

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
      console.log(`LOG: ${snapshot.size}`)
    })
    .then(() => res.status(200).end()))

exports.setTestUsersReadyToMatch = functions.https.onRequest((req, res) =>
  admin
    .firestore()
    .collection('testUsers')
    .get()
    .then((snapshot) => {
      snapshot.forEach(doc => doc.ref.update({ readyToMatch: true }))
      res.status(200).end()
    }))

exports.aggregateMatchInfo = functions.https.onRequest((req, res) => {
  let aggregateInfoObject = {}
  const matchSimilarityScores = []
  const matchSizes = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
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
        const numberOfFlatmates = match.flatMates.length
        numberOfUsersCounted += numberOfFlatmates
        matchSizes[numberOfFlatmates] += 1
        if (match.custom) {
          customMatchCounter += 1
        }
        if (numberOfFlatmates > 2) {
          matchSimilarityScores.push(match.flatAverageScore)
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
      const ratioOfPeopleInSingels = matchSizes[1] / numberOfUsersCounted
      aggregateInfoObject = {
        averageScore,
        matchSizes,
        matchCounter,
        matchesWithBestOrigins,
        numberOfUsersCounted,
        ratioOfPeopleIn3or4or5Flats,
        ratioOfPeopleInSingels,
        customMatchCounter
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
  // const { readyToMatch } = req.body

  clusteringAlgorithms.matchAllAvailableUsers()
  res.status(200).end()
})

exports.onMatchCreate = functions.firestore
  .document('matches/{matchId}')
  .onCreate((event) => {
    console.log('LOG: Event data data()', event.data.data())
    const match = event.data.data()

    if (!match) {
      console.log('LOG: No match provided to get best origin for')
      return 'No match provided to get best origin for'
    }

    if (match.flatMates.length < 3) {
      return 'Not enough people to do a location cluster match'
    }

    return locationAlgorithms.getBestOriginForMatch(match)
  })

exports.getBestOriginHTTPforMatch = functions.https.onRequest((req, res) => {
  const { matchId } = req.body

  return admin
    .firestore()
    .collection('matches')
    .doc(matchId)
    .get()
    .then(matchDoc => getBestOriginForMatch(matchDoc.data()))
    .then(() => res.status(200).end())
    .catch(err => console.error(err))
})

exports.scoreApartment = functions.https.onRequest((req, res) => {
  const { address, flatmates } = req.body
  console.log(address, flatmates)
  const origins = [address]
  const originsToDestinationsObject = locationAlgorithms.getOriginsToDestinationsObject(
    origins,
    flatmates
  )
  const score = originsToDestinationsObject.address.combinedDuration
  res.status(200).send({ score })
})
