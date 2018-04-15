import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
const cors = require('cors')({ origin: true })
import {createTestUsers} from './utils/createTestData'
import {matchAllAvailableUsers} from './clusteringAlgorithms/clusteringPipeline'
import {getBestOriginForMatch, getOriginsToDestinationsObject} from './location/locationAlgorithms'
import { deleteMatchClusterCollection } from './utils/dbCleanupFunctions'
import { getListingDetails, getPropertyList} from './location/finnScraper'

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const populateDatabaseWithTestUsersHTTPS = functions.https.onRequest( async (req, res) => {
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
        .catch(err => console.log('LOG: Error adding test user', err))))
      .catch(err => {
        console.log('ERROR: Error in creating test users', err)
        return []
      })
    console.log(`LOG: ${results.length} Test users created`)
    res.status(200).end()
  })
  
  export const deleteTestUsers = functions.https.onRequest(async (req, res) => {
    const deletedUsers = []
    await admin.firestore().collection('testUsers').get().then(snapshot => snapshot.forEach((doc) => {
        deletedUsers.push(doc.data())
        doc.ref.delete()
      })).catch(err => res.status(500).send(err))
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
  
  export const setTestUsersReadyToMatch = functions.https.onRequest( async (req, res) => {
    await admin
      .firestore()
      .collection('testUsers')
      .get()
      .then((snapshot) => {
        snapshot.forEach(doc => doc.ref.update({ readyToMatch: true, currentMatches: {} }))
        console.log(`${snapshot.size} test users ready to match`)
      }).catch(err => res.status(500).send(err))
    res.status(200).end()
})
      
  
  export const resetDatabase = functions.https.onRequest( async (req, res) => {
    await setTestUsersReadyToMatch(req, res)
    await admin
      .firestore()
      .collection('users')
      .get()
      .then((snapshot) => {
        snapshot.forEach(doc => doc.ref.update({ readyToMatch: true, currentMatches: {} }))
        console.log(`${snapshot.size} real users updated`)
      }).catch(err => console.log(err) || res.status(500).send(err))
    await deleteMatchClusterCollection().catch(err => console.log(err) || res.status(500).send(err))
    res.status(200).end()
  })
  
  export const aggregateMatchInfo = functions.https.onRequest((req, res) => {
    let aggregateInfoObject = {}
    const matchSimilarityScores = []
    const matchSizes = {
      0: 0,
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
  
  export const getMatchedByCluster = functions.https.onRequest((req, res) => {
    // const userData = event.data.data()
    // const { readyToMatch } = req.body
    cors(req, res, () => {
      matchAllAvailableUsers('PmzsNVCnUSMVSMu2WGRa4omxez52')
      res.status(200).end()
    })
  })
  
  export const getMatchedByClusterOnSave = functions.https.onRequest( (req, res) => {
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
          .catch(err => console.log('LOG: Error adding test user', err))))
        .catch(err =>           console.log('ERROR: Error in creating test users', err))
      const matches = await matchAllAvailableUsers(userUid)
      console.log('matches created',matches.length)
      res.status(200).end()
    })
  })
  
  
  export const onMatchCreate = functions.firestore
    .document('matches/{matchId}')
    .onCreate((snap, context) => {
    //.onCreate((event) => {
      const match = snap.data()
      return getBestOriginForMatch(match)
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
  
  export const scoreApartment = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      // curl -H 'Content-Type: application/json' -d '{"address": "Nydalen Oslo", "flatmates": [{"workplace":"Netlight Oslo"}, {"workplace":"Capra Consulting Oslo"}]}' https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment
      const { address, flatmates } = req.body
  
      if (!address || !flatmates) {
        res.status(400).end()
      }
      const origins = [encodeURI(address)]
      getOriginsToDestinationsObject(
        origins,
        flatmates
      ).then((originsToDestinationsObject) => {
        const score = originsToDestinationsObject[Object.keys(originsToDestinationsObject)[0]].combinedDuration
        res.status(200).send({ score })
      }).catch((err) => {
        console.log('Error in scoring apartment', err)
        res.status(300).end()
      })
    })
  })
  
  export const getListingDetailsHTTPS = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      // curl -H 'Content-Type: application/json' -d '{"address": "Nydalen Oslo", "flatmates": [{"workplace":"Netlight Oslo"}, {"workplace":"Capra Consulting Oslo"}]}' https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment
      const { finnURL } = req.body
      console.log(finnURL)
  
      if (!finnURL) {
        res.status(400).end()
      }
      return getListingDetails(finnURL).then((listing) => {
        res.status(200).send(listing)
      }).catch((err) => {
        console.log('Error in getting listing from Finn', err)
        res.status(300).end()
      })
    })
  })
  
  export const updateUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      admin.firestore().collection('users').doc('4spel7y5oJg0OarPxcHxhdwkgPF2').get()
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
  
  