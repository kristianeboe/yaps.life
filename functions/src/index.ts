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
  /* const snapshot = await admin
    .firestore()
    .collection('users')
    .get()
  snapshot.forEach(doc =>
    doc.ref.update({ readyToMatch: true, currentMatches: {} }))
  console.log(`${snapshot.size} real users updated`) */
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

export const matchAllAvailableUsersHTTPS = functions.https.onRequest((req, res) => {
  // const userData = event.data.data()
  // const { readyToMatch } = req.body
  cors(req, res, async () => {
    await matchAllAvailableUsers()
    res.status(200).end()
  })
})


export const getDemoMatched = functions.https.onRequest((req, res) => {
  const { userUid } = req.body
  cors(req, res, async () => {
    if (!userUid) res.status(500).send("Error in doing demo match, usedID not defined")
    const userRef = admin
      .firestore()
      .collection('users')
      .doc(userUid)
    const userDoc = await userRef.get()  
    const testUsersSnapshot = await admin
      .firestore()
      .collection('testUsers')
      .get()
    const testUsers = []
    testUsersSnapshot.forEach((testUser) => {
      testUsers.push(testUser.data())
    })
    console.log(testUsers.length)
    const userData = userDoc.data()
    const vectors = extractVectorsFromUsers(testUsers, false)
    const userVector = extractVectorsFromUsers([userData], false)[0]
    const topK = knnClusteringSingleMatchTestUsers(userVector, vectors, 4)
    const flatmates = [userData].concat(topK.map(id => testUsers[id]))
    const match = await createMatchFromFlatmates(flatmates, true)
    // await userRef.update({readyToMatch: true})
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
    const listings: any = await Promise.all(listingURLs.slice(0, 10).map(url => getListingDetails(url))).catch(err => console.log(err))

    listings.forEach(async listing => {
      await addListingToMatch(listing, updatedMatch)
    })

  })

export const onListingCreate = functions.firestore
.document('listings/{listingId}')
.onCreate(async (snap, context) => {
  const listing = snap.data()
  console.log(listing)
  const matchesSnapsot = await admin.firestore().collection('matches').get()
  matchesSnapsot.forEach(async matchDoc => {
    await matchListingWithMatch(snap, matchDoc)
  })
})

async function matchListingWithMatch(listingDoc, matchDoc) {
  const listing = listingDoc.data()
  const match = matchDoc.data()
  if(listing.numberOfBedrooms === match.flatmates.length) {
    const propScore = mapPropScoreToPercentage(euclidianDistanceSquared(
      match.groupPropertyVector,
      listing.propertyVector
    ))
    // add distance metric
    if (propScore > 70) {
      await addListingToMatch(listing, match)
      /* const commuteScore = await scoreApartment(listing.address, match.flatmates)
      console.log(commuteScore)
      matchDoc.ref.update({propertyList: [...match.propertyList, {listingId: listingDoc.id, commuteScore, groupScore: propScore}]}) */
      listingDoc.ref.update({matchedWith: [matchDoc.id]})
      // const newChat = admin.firestore().collection('chats').doc(matchDoc.id + listing.doc.id)
      // Set metadata about chat
      // create chat between parties
      listingDoc.ref.collection(matchDoc.id)
      .add({
        text: "It's a match! Time to set up a viewing" ,
        dateTime: Date.now(),
        from: {
          uid: 'admin',
          displayName: 'Admin',
          photoURL:
              'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg'
        }
      })
      // Send email to parties
      
    }
  }
}

export const matchListingsWithMatches = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const [matchesSnapsot, listingsSnapshot] = await Promise.all([
      admin.firestore().collection('matches').get(),
      admin.firestore().collection('listings').get()]
    )
    console.log(matchesSnapsot.size, listingsSnapshot.size)
    listingsSnapshot.forEach(listingDoc => {
      matchesSnapsot.forEach( async matchDoc => {
        await matchListingWithMatch(listingDoc, matchDoc)
      })
    })
    res.status(200).end()

  })
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
    const { listingURL } = req.body
    console.log(listingURL, req.body)

    if (!listingURL) {
      res.status(400).end()
    }
    const listing = await getListingDetails(listingURL)
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

export const updateUsers = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    await admin
      .firestore()
      .collection('testUsers')
      .get()
      .then((snapshot) => {
        snapshot.forEach(doc => {
          const data = doc.data()
          /* const propertyVector = data.propertyVector ? data.propertyVector : [3,3,3]
          propertyVector.push(3) */
          doc.ref.update({ fieldOfStudy: data.studyProgramme })
          console.log('User ' + doc.id + 'updated')
        })
      }).catch((err) => {
        console.log('Error in updating users', err)
        res.status(300).end()
      })
        
      res.status(200).end()
  })
})



export const addListingToMatchHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {listing, matchId} = req.body
     /* listing = {
      uid: '1d392500-d4b6-4de3-b663-ec698366d07c',
      title: 'Home in Oslo',
      numberOfBedrooms: '4',
      pricePerRoom: 60000,
      propertyType: 'apartment',
      matchLocation: 'oslo',
      address: 'Arnebråtveien 75D Oslo',
      propertyVector: [1, 3, 3, 5],
      addressLatLng: { lat: 222, lng: 333 },
      listingURL: 'https://finn.no',
    }
    matchId = 'e862ffb6-a3bb-4ffa-a03d-9eb974b55966' */
    console.log(req.body)

    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get()

    await addListingToMatch(listing, matchDoc.data())

    res.status(200).end()
  })
})

async function addListingToMatch(listing, match){

  const {groupPropertyVector, flatmates, propertyList} = match

  // group score
  const groupScore = mapPropScoreToPercentage(euclidianDistanceSquared(
    groupPropertyVector,
    listing.propertyVector
  ))

  // commute score
  const commuteScore = await scoreApartment(listing.address, flatmates)

  // add to match
  await admin.firestore().collection('matches').doc(match.uid).update({
    propertyList: [...propertyList, {listing, commuteScore, groupScore}]
  })
}

/* const listing = {
  uid: '1d392500-d4b6-4de3-b663-ec698366d07c',
  title: 'Home in Oslo',
  numberOfBedrooms: '4',
  pricePerRoom: 60000,
  propertyType: 'apartment',
  matchLocation: 'oslo',
  address: 'Arnebråtveien 75D Oslo',
  propertyVector: [1, 3, 3, 5],
  addressLatLng: { lat: 222, lng: 333 },
  listingURL: 'https://finn.no',
}

const matchId = '1d392500-d4b6-4de3-b663-ec698366d07c'
 */