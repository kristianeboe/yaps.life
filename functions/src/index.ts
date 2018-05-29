import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as uuid from 'uuid'

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
  getAverageCommuteTime
} from './location/locationAlgorithms'
import { deleteMatchClusterCollection, updateDocument, updateCollection, aggregateMatchInfo, resetDatabase, populateDatabaseWithTestUsers } from './utils/dbFunctions'
import { getListingDetails, getPropertyList } from './location/finnScraper'
import { extractVectorsFromUsers } from './utils/vectorFunctions'
import { knnClusteringSingleMatchTestUsers } from './clusteringAlgorithms/knnClustering'
import { userRecordConstructor } from 'firebase-functions/lib/providers/auth';

admin.initializeApp()


export const updateDocumentHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    return updateDocument(req, res)
  })
})
/*

export const updateCollectionHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    return updateCollection(req, res)
  })
})

export const aggregateMatchInfoHTTPS = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    return aggregateMatchInfo(req, res)
  })
})

export const resetDatabaseHTTPS = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    return resetDatabase(req, res)
  })
})
 */

export const populateDatabaseWithTestUsersHTTPS = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    return populateDatabaseWithTestUsers(req, res)
  })
})

export const matchAllAvailableUsersHTTPS = functions.https.onRequest((req, res) => {
  // const userData = event.data.data()
  // const { readyToMatch } = req.body
  cors(req, res, async () => {
    await matchAllAvailableUsers()
    res.status(200).end()
  })
})

export const matchListingsWithMatches = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const [matchesSnapsot, listingsSnapshot] = await Promise.all([
      admin.firestore().collection('matches').get(),
      admin.firestore().collection('listings').get()]
    )
    console.log(matchesSnapsot.size, listingsSnapshot.size)
    listingsSnapshot.forEach(async listingDoc => {
      await matchesSnapsot.forEach( async matchDoc => {
        await matchListingWithMatch(listingDoc, matchDoc)
      })
    })
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
    userRef.update({
      gettingCloudMatched: 25
    })
    const userDoc = await userRef.get()  
    const testUsersSnapshot = await admin
      .firestore()
      .collection('testUsers')
      .get()
    const testUsers = []
    testUsersSnapshot.forEach((testUser) => {
      testUsers.push(testUser.data())
    })
    await userRef.update({
      gettingCloudMatched: 40
    })
    console.log(testUsers.length)
    const userData = userDoc.data()
    const vectors = extractVectorsFromUsers(testUsers, false)
    const userVector = extractVectorsFromUsers([userData], false)[0]
    await userRef.update({
      gettingCloudMatched: 60
    })
    const topK = knnClusteringSingleMatchTestUsers(userVector, vectors, 4)
    await userRef.update({
      gettingCloudMatched: 75
    })
    const flatmates = [userData].concat(topK.map(id => testUsers[id]))
    const match = await createMatchFromFlatmates(flatmates, true)
    await userRef.update({
      gettingCloudMatched: 0
    })
    // await userRef.update({readyToMatch: true})
    res.status(200).end()
  })
})

export const getSoloMatched = functions.https.onRequest((req, res) => {
  const { userUid } = req.body
  cors(req, res, async () => {
    const userRef = admin.firestore().collection('users').doc(userUid)
    userRef.update({
      gettingCloudMatched: 40
    })
    const userDoc = await userRef.get()
    const flatmates = [userDoc.data()]
    const match = await createMatchFromFlatmates(flatmates, false, false, true)
    await userRef.update({
      gettingCloudMatched: 0
    })
    res.status(200).end()
  })
})

export const onMatchCreate = functions.firestore
  .document('matches/{matchId}')
  .onCreate(async (snap, context) => {
    const match = snap.data()

    // Get best origin and data from external sources
    const updatedMatch = await getBestOriginForMatch(match)
    const localListingURLs = await getPropertyList(updatedMatch.finnQueryString)//'https://www.finn.no/realestate/lettings/search.html?location=0.20061&location=1.20061.20507&location=1.20061.20512&location=1.20061.20511&location=1.20061.20510&location=1.20061.20513&location=1.20061.20509&location=1.20061.20508&no_of_bedrooms_from=' + updatedMatch.flatmates.length + '&property_type=1&property_type=3&property_type=4&property_type=2&sort=0')//updatedMatch.finnQueryString)
    const globalListingURLs = await getPropertyList(`https://www.finn.no/realestate/lettings/search.html?location=0.20061&location=1.20061.20507&location=1.20061.20512&location=1.20061.20511&location=1.20061.20510&location=1.20061.20513&location=1.20061.20509&location=1.20061.20508&no_of_bedrooms_from=${updatedMatch.flatmates.length === 1 ? '1&property_type=17' :  updatedMatch.flatmates.length + '&property_type=1&property_type=3&property_type=4&property_type=2&sort=0'}`) //updatedMatch.finnQueryString)
    const localFinnListings= localListingURLs.slice(0, 10)
    const globalFinnListings= globalListingURLs.slice(0, 20)
    const finnListingsURLs = [...new Set(localFinnListings.concat(globalFinnListings))]
    const finnListings = await Promise.all(finnListingsURLs.map(url => getListingDetails(url, match.flatmates.length)))
    const topListings = finnListings.filter(listing => (console.log(listing.numberOfBedrooms) ||  Number(listing.numberOfBedrooms) === match.flatmates.length) && (getInitialGroupScoreForListing(listing, updatedMatch) < 2)).sort((a,b) => getInitialGroupScoreForListing(b, updatedMatch) - getInitialGroupScoreForListing(a, updatedMatch) ).slice(0, 6)
    console.log(topListings)
    await Promise.all(topListings.map( async listing => {
      const groupScore = getInitialGroupScoreForListing(listing, updatedMatch)
      const commuteTime = await getAverageCommuteTime(listing.address, updatedMatch.flatmates)
      // add external listing to match
      await addExternalListingToMatch(listing, groupScore, commuteTime, updatedMatch)

    }))
    
    const listingsSnapshot = await admin.firestore().collection('listings').get()
    listingsSnapshot.forEach(async listingDoc => {
      await matchListingWithMatch(listingDoc, snap)
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
    const groupScore = getInitialGroupScoreForListing(listing, match)
    // add distance metric/heuristic
    if (groupScore < 2) {
      const commuteTime = await getAverageCommuteTime(listing.address, match.flatmates)
      const listingScore = getFinalListingScore(commuteTime, match.groupPropertyVector, listing.propertyVector)
      const {groupPropertyVector, flatmates, propertyList} = match
      await matchDoc.ref.update({
        [`currentListings.${listingDoc.id}`]: {listingId: listingDoc.id, commuteTime, listingScore, groupScore, timeStamp: new Date(), source: 'internal'},
      })
      await listingDoc.ref.update({
        [`currentMatches.${matchDoc.id}`]: {matchId: matchDoc.id, timeStamp: new Date()}
      })
      
      
      // Set metadata about chat
      // create chat between parties
      await listingDoc.ref.collection(matchDoc.id)
      .add({
        text: "It's a match! Time to set up a viewing" ,
        dateTime: new Date(),
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

export const getBestOriginForMatchHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { matchId } = req.body
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get()
    const match = matchDoc.data()
    await getBestOriginForMatch(match)
    res.status(200).end()
  })
})

export const getListingDetailsHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { listingURL, nrOfFlatmates } = req.body
    console.log(listingURL, req.body)

    if (!listingURL) {
      res.status(400).end()
    }
    const listing = await getListingDetails(listingURL, nrOfFlatmates)
    res.status(200).send(listing)
  })
})

export const addExternalListingToMatchHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {listing, matchId} = req.body
    console.log(req.body)

    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get()
    const match = matchDoc.data()
    const groupScore = getInitialGroupScoreForListing(listing, match)
    
    if (groupScore < 2) {
      // commute score
      const commuteTime = await getAverageCommuteTime(listing.address, match.flatmates)
      await addExternalListingToMatch(listing, groupScore, commuteTime, match)
    }

    res.status(200).end()
  })
})

async function addExternalListingToMatch(listing, groupScore, commuteTime, match) {
  const { propertyList} = match
  const listingId = uuid.v4()
  const listingScore = getFinalListingScore(commuteTime, match.groupPropertyVector, listing.propertyVector)
  await admin.firestore().collection('matches').doc(match.uid).update({
    [`currentListings.${listingId}`]: {listingId, listingData: listing, commuteTime, listingScore,  groupScore, timeStamp: new Date(), source: 'external'},
  })
}

function getInitialGroupScoreForListing(listing, match){
  const weights = [0.4, 0.2, 0.2, 0.2]
  const groupPropertyVector = match.groupPropertyVector.map((el, i) => el * weights[i])
  const propertyVector = listing.propertyVector.map((el, i) => el * weights[i])

  // group score
  const groupScore = euclidianDistanceSquared(
    groupPropertyVector,
    propertyVector
  )
  return groupScore
}


function getFinalListingScore(commuteTime, groupPropertyVector, propertyVector){
  const weights = [0.3, 0.35, 0.15, 0.1, 0.1]
  const commuteScore = commuteTime < 720 ? 5 : commuteTime < 1000 ? 4.5 : commuteTime < 1200 ? 4 : commuteTime < 1500 ? 3.5 : commuteTime < 1820 ? 3 : commuteTime < 2200 ? 2.5 : commuteTime < 2450 ? 2 : 1

  const expandedGroupVector = [4].concat(groupPropertyVector)
  const expandedPropertyVector = [commuteScore].concat(propertyVector)

  const listingScore = euclidianDistanceSquared(expandedGroupVector, expandedPropertyVector)

  const WexpandedGroupVector = expandedGroupVector.map((el, i) => el * weights[i])
  const WexpandedPropertyVector = expandedPropertyVector.map((el, i) => el * weights[i])

  const WlistingScore = euclidianDistanceSquared(WexpandedGroupVector, WexpandedPropertyVector)
  // const finalScore = Math.floor((1 - WlistingScore) * 100) moved to client side

  return WlistingScore
}