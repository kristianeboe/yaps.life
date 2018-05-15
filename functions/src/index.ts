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
  getAverageCommuteTime
} from './location/locationAlgorithms'
import { deleteMatchClusterCollection } from './utils/dbFunctions'
import { getListingDetails, getPropertyList } from './location/finnScraper'
import { extractVectorsFromUsers } from './utils/vectorFunctions'
import { knnClusteringSingleMatchTestUsers } from './clusteringAlgorithms/knnClustering'

admin.initializeApp()



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
    const match = snap.data()

    // Get best origin and data from external sources
    const updatedMatch = await getBestOriginForMatch(match)
    const listingURLs = await getPropertyList(updatedMatch.finnQueryString)
    const finnListings: any = await Promise.all(listingURLs.slice(0, 10).map(url => getListingDetails(url))).catch(err => console.log(err))

    finnListings.forEach(async listing => {
      // score listing
      const groupScore = scoreListing(listing, updatedMatch)
      
      if (groupScore > 70) {
        // commute score
        const commuteTime = await getAverageCommuteTime(listing.address, updatedMatch.flatmates)
        // add external listing to match
        await addListingToMatch(listing, groupScore, commuteTime, updatedMatch)
      }
    })

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
    const groupScore = scoreListing(listing, match)
    // add distance metric/heuristic
    if (groupScore > 70) {
      const commuteTime = await getAverageCommuteTime(listing.address, match.flatmates)
      const {groupPropertyVector, flatmates, propertyList} = match
      await matchDoc.update({
        propertyList: [...propertyList, {listing, commuteTime, groupScore}]
      })
      listingDoc.ref.update({matchedWith: [matchDoc.id]})

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

export const getBestOriginForMatchHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { matchId } = req.body
    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get()
    await getBestOriginForMatch(matchDoc.data())
    res.status(200).end()
  })
})

export const getListingDetailsHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { listingURL } = req.body
    console.log(listingURL, req.body)

    if (!listingURL) {
      res.status(400).end()
    }
    const listing = await getListingDetails(listingURL)
    res.status(200).send(listing)
  })
})

export const addListingToMatchHTTPS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {listing, matchId} = req.body
    console.log(req.body)

    const matchDoc = await admin.firestore().collection('matches').doc(matchId).get()
    const match = matchDoc.data()
    const groupScore = scoreListing(listing, match)
    
      if (groupScore > 70) {
        // commute score
        const commuteTime = await getAverageCommuteTime(listing.address, match.flatmates)
        await addListingToMatch(listing, groupScore, commuteTime, match)
      }
    


    res.status(200).end()
  })
})

async function addListingToMatch(listing, commuteTime, groupScore, match){
  const {groupPropertyVector, flatmates, propertyList} = match

  // add to match
  await admin.firestore().collection('matches').doc(match.uid).update({
    propertyList: [...propertyList, {listing, commuteTime, groupScore}]
  })
}

function scoreListing(listing, match){
  const {groupPropertyVector} = match

  // group score
  const groupScore = mapPropScoreToPercentage(euclidianDistanceSquared(
    groupPropertyVector,
    listing.propertyVector
  ))
  return groupScore
}
