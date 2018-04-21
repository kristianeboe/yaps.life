import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const euclidianDistanceSquared = require('euclidean-distance/squared')
const cors = require('cors')({ origin: true })

import { createTestUsers, exampleMatch } from './utils/createTestData'
import {
  matchAllAvailableUsers,
  createMatchFromFlatmates,
  mapPropScoreToPercentage
} from './clusteringAlgorithms/clusteringPipeline'
import {
  getBestOriginForMatch,
  getOriginsToDestinationsObject,
  scoreApartment
} from './location/locationAlgorithms'
import { deleteMatchClusterCollection } from './utils/dbCleanupFunctions'
import { getListingDetails, getPropertyList } from './location/finnScraper'
import { extractVectorsFromUsers } from './utils/vectorFunctions'
import { knnClusteringSingleMatchTestUsers } from './clusteringAlgorithms/knnClustering'

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const populateDatabaseWithTestUsersHTTPS = functions.https.onRequest(async (req, res) => {
  let { nrOfTestUsers } = req.body

  if (!nrOfTestUsers) {
    nrOfTestUsers = 52
  }
  const testUsers = createTestUsers(nrOfTestUsers)

  const results = await Promise.all(testUsers.map(testUser =>
    admin
      .firestore()
      .collection('testUsers')
      .doc(testUser.uid)
      .set(testUser)
      .catch(err => console.log('LOG: Error adding test user', err)))).catch((err) => {
    console.log('ERROR: Error in creating test users', err)
    return []
  })
  console.log(`LOG: ${results.length} Test users created`)
  res.status(200).end()
})

export const deleteTestUsers = functions.https.onRequest(async (req, res) => {
  const deletedUsers = []
  await admin
    .firestore()
    .collection('testUsers')
    .get()
    .then(snapshot =>
      snapshot.forEach((doc) => {
        deletedUsers.push(doc.data())
        doc.ref.delete()
      }))
    .catch(err => res.status(500).send(err))
  console.log(`${deletedUsers.length}test users deleted`)
  res.status(200).end()
})

export const countTestUsers = functions.https.onRequest(async (req, res) => {
  await admin
    .firestore()
    .collection('testUsers')
    .get()
    .then((snapshot) => {
      console.log(`LOG: ${snapshot.size} test users found`)
    })
    .catch(err => res.status(500).send(err))
  res.status(200).end()
})

export const setTestUsersReadyToMatch = functions.https.onRequest(async (req, res) => {
  await admin
    .firestore()
    .collection('testUsers')
    .get()
    .then((snapshot) => {
      snapshot.forEach(doc =>
        doc.ref.update({ readyToMatch: true, currentMatches: {} }))
      console.log(`${snapshot.size} test users ready to match`)
    })
    .catch(err => res.status(500).send(err))
  res.status(200).end()
})

export const resetDatabase = functions.https.onRequest(async (req, res) => {
  await setTestUsersReadyToMatch(req, res)
  const snapshot = await admin
    .firestore()
    .collection('users')
    .get()
  snapshot.forEach(doc =>
    doc.ref.update({ readyToMatch: true, currentMatches: {} }))
  console.log(`${snapshot.size} real users updated`)
  await deleteMatchClusterCollection() // .catch(err => console.log(err) || res.status(500).send(err))
  res.status(200).end()
})

export const aggregateMatchInfo = functions.https.onRequest(async (req, res) => {
  let aggregateInfoObject = {}
  const matchSimilarityScores = []
  const matchSizes = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  }
  let matchCounter = 0
  let matchesWithBestOrigins = 0
  let numberOfUsersCounted = 0
  let customMatchCounter = 0
  const snapshot1 = await admin
    .firestore()
    .collection('matches')
    .get()

  snapshot1.forEach((matchDoc) => {
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

  const averageScore =
      matchSimilarityScores.reduce((a, b) => a + b, 0) /
      matchSimilarityScores.length
  const ratioOfPeopleIn3or4or5Flats =
      (matchSizes[3] * 3 + matchSizes[4] * 4 + matchSizes[5] * 5) /
      numberOfUsersCounted
  const ratioOfPeopleLessThan3 =
      (matchSizes[1] + matchSizes[2] * 2) / numberOfUsersCounted
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

  return true
})

export const getMatchedByCluster = functions.https.onRequest((req, res) => {
  // const userData = event.data.data()
  // const { readyToMatch } = req.body
  cors(req, res, async () => {
    await matchAllAvailableUsers('PmzsNVCnUSMVSMu2WGRa4omxez52')
    res.status(200).end()
  })
})

export const getMatchedByClusterOnSave = functions.https.onRequest((req, res) => {
  // const userData = event.data.data()
  // const { readyToMatch } = req.body
  let { userUid } = req.body
  console.log(userUid)
  if (!userUid) {
    userUid = 'PmzsNVCnUSMVSMu2WGRa4omxez52'
    console.log('default', userUid)
  }

  cors(req, res, async () => {
    const testUsers = createTestUsers(50)
    await Promise.all(testUsers.map(testUser =>
      admin
        .firestore()
        .collection('testUsers')
        .doc(testUser.uid)
        .set(testUser)
        .catch(err => console.log('LOG: Error adding test user', err)))).catch(err => console.log('ERROR: Error in creating test users', err))
    const matches = await matchAllAvailableUsers(userUid)
    console.log('matches created', matches.length)
    res.status(200).end()
  })
})

export const getSingleMatchByKNNOnSave = functions.https.onRequest((req, res) => {
  let { userUid } = req.body
  console.log(userUid)
  if (!userUid) {
    userUid = 'PmzsNVCnUSMVSMu2WGRa4omxez52'
    console.log('default', userUid)
  }
  cors(req, res, async () => {
    const userRef = await admin
      .firestore()
      .collection('users')
      .doc(userUid)
      .get()
    const testUsersSnapshot = await admin
      .firestore()
      .collection('testUsers')
      .get()
    const testUsers = []
    testUsersSnapshot.forEach((testUser) => {
      testUsers.push(testUser.data())
    })
    console.log(testUsers.length)
    const userData = userRef.data()
    const vectors = extractVectorsFromUsers(testUsers, false)
    const userVector = extractVectorsFromUsers([userData], false)[0]
    const topK = knnClusteringSingleMatchTestUsers(userVector, vectors, 4)
    console.log(topK)
    const flatmates = [userData].concat(topK.map(id => testUsers[id]))
    const match = await createMatchFromFlatmates(flatmates)
    res.status(200).end()
  })
})

export const onMatchCreate = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    // .onCreate((event) => {
    const match = snap.data()

    const updatedMatch = await getBestOriginForMatch(match)
    const listingURLs = await getPropertyList(updatedMatch.finnQueryString)
    const listings: any = await Promise.all(listingURLs.slice(0, 2).map(url => getListingDetails(url))).catch(err => console.log(err))
    const scores = await Promise.all(listings.map((listing) => {
      const { address, price, primærrom } = listing

      const pricePerPerson =
          price < 15000
            ? price
            : Math.floor(price / updatedMatch.flatmates.length)

      const propertySize = primærrom > 100 ? 5 : primærrom < 60 ? 1 : 3
      const budget =
          pricePerPerson > 12000 ? 5 : pricePerPerson < 7000 ? 1 : 3
      const newness = 3
      const propertyVector = [budget, propertySize, newness]

      listing.groupScore = mapPropScoreToPercentage(euclidianDistanceSquared(
        updatedMatch.groupPropertyVector,
        propertyVector
      ))
      return scoreApartment(listing.address, updatedMatch.flatmates)
    }))
    scores.forEach((score, i) => (listings[i].commuteScore = score))
    console.log(listings[0])

    return admin
      .firestore()
      .collection('matches')
      .doc(updatedMatch.uid)
      .update({
        propertyList: listings
      })

    /* if (!match) {
        console.log('LOG: No match provided to get best origin for')
      }

      if (match.flatmates.length < 3) {
        console.log('LOG: Not enough people to do a location cluster match')
      }

      if (match && match.flatmates.length > 3) */
  })

export const getBestOriginHTTPforMatch = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
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
})

export const scoreApartmentHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // curl -H 'Content-Type: application/json' -d '{"address": "Nydalen Oslo", "flatmates": [{"workplace":"Netlight Oslo"}, {"workplace":"Capra Consulting Oslo"}]}' https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment
    const { address, flatmates } = req.body

    if (!address || !flatmates) {
      res.status(400).end()
    }
    const score = await scoreApartment(address, flatmates)
    res.status(200).send({ score })
  })
})

export const getListingDetailsHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // curl -H 'Content-Type: application/json' -d '{"address": "Nydalen Oslo", "flatmates": [{"workplace":"Netlight Oslo"}, {"workplace":"Capra Consulting Oslo"}]}' https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment
    const { finnURL } = req.body
    console.log(finnURL)

    if (!finnURL) {
      res.status(400).end()
    }
    const listing = await getListingDetails(finnURL)
    res.status(200).send(listing)
  })
})

export const updateUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    admin
      .firestore()
      .collection('users')
      .doc('4spel7y5oJg0OarPxcHxhdwkgPF2')
      .get()
      .then((doc) => {
        const data = doc.data()
        const oldAnswerVector = data.answerVector
        const answerVector = oldAnswerVector.map(el => el - 3)
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

export const getFinnURLList = functions.https.onRequest(async (req, res) => {
  const URL =
    'https://www.finn.no/realestate/lettings/search.html?location=0.20061&location=1.20061.20508&no_of_bedrooms_from=4&property_type=1&property_type=3&property_type=4&property_type=2'
  const updatedMatch = exampleMatch
  const listingURLs = await getPropertyList(updatedMatch.finnQueryString)
  const listings: any = await Promise.all(listingURLs.slice(0, 2).map(url => getListingDetails(url))).catch(err => console.log(err))
  const scores = await Promise.all(listings.map((listing) => {
    const { address, price, primærrom } = listing

    const pricePerPerson =
        price < 15000
          ? price
          : Math.floor(price / updatedMatch.flatmates.length)

    const propertySize = primærrom > 100 ? 5 : primærrom < 60 ? 1 : 3
    const budget = pricePerPerson > 12000 ? 5 : pricePerPerson < 7000 ? 1 : 3
    const newness = 3
    const propertyVector = [budget, propertySize, newness]

    listing.groupScore = mapPropScoreToPercentage(euclidianDistanceSquared(
      updatedMatch.groupPropertyVector,
      propertyVector
    ))
    return scoreApartment(listing.address, updatedMatch.flatmates)
  }))
  scores.forEach((score, i) => (listings[i].commuteScore = score))
  console.log(listings[0])
  await admin
    .firestore()
    .collection('matches')
    .doc(updatedMatch.uid)
    .update({
      propertyList: listings
    })
  res.status(200).end()
})
/*   console.log(score, groupScore, propertyVector)
  console.log(listing) */
