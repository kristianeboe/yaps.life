import * as admin from'firebase-admin'
import * as functions from 'firebase-functions'
const cors = require('cors')({ origin: true })


import { createTestUsers, exampleMatch } from './createTestData'
import {
  matchAllAvailableUsers,
  createMatchFromFlatmates,
  mapPropScoreToPercentage
} from '../clusteringAlgorithms/clusteringPipeline'
import {
  getBestOriginForMatch,
  getOriginsToDestinationsObject,
  getAverageCommuteTime
} from '../location/locationAlgorithms'
import { getListingDetails, getPropertyList } from '../location/finnScraper'
import { extractVectorsFromUsers } from './vectorFunctions'
import { knnClusteringSingleMatchTestUsers } from '../clusteringAlgorithms/knnClustering'



function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query
    .get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0
      }

      // Delete documents in a batch
      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
        doc.ref.collection('messages').get().then((snapMatch) => {
          snapMatch.forEach(message => message.ref.delete())
        }).catch(err => console.log(err))
        batch.delete(doc.ref)
      })

      return batch.commit().then(() => snapshot.size)
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve()
        return
      }
      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject)
      })
    })
    .catch(reject)
}

export function deleteMatchClusterCollection() {
  const batchSize = 100
  const db = admin.firestore()
  const collectionRef = admin.firestore().collection('matches')
  const query = collectionRef
    .where('custom', '==', false)
    .orderBy('__name__')
    .limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject)
  })
}


export async function updateDocument(req, res) {
  const response = await admin
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
    .catch((err) => {
      console.log('Error in updating user', err)
      res.status(300).end()
    })
    console.log('User updated')
    res.status(200).end()
}

export async function updateCollection(req, res) {
    await admin
      .firestore()
      .collection('listings')
      .get()
      .then((snapshot) => {
        snapshot.forEach(doc => {
          const data = doc.data()
          /* const propertyVector = data.propertyVector ? data.propertyVector : [3,3,3]
          propertyVector.push(3) */
          doc.ref.update({ 
            source: 'internal',
            currentMatches: {},
           })
          /* if (data.flatmates.length === 0) {
            console.log('match ' + doc.id + 'deleted')
            doc.ref.delete()
          } */
        })
      }).catch((err) => {
        console.log('Error in updating users', err)
        res.status(300).end()
      })
      await admin
      .firestore()
      .collection('matches')
      .get()
      .then((snapshot) => {
        snapshot.forEach(doc => {
          const data = doc.data()
          /* const propertyVector = data.propertyVector ? data.propertyVector : [3,3,3]
          propertyVector.push(3) */
          doc.ref.update({ 
            currentListings: {}
           })
          if (data.flatmates.length === 0) {
            console.log('match ' + doc.id + 'deleted')
            doc.ref.delete()
          }
        })
      }).catch((err) => {
        console.log('Error in updating users', err)
        res.status(300).end()
      })
      res.status(200).end()
  }



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

export async function aggregateMatchInfo(req, res) {
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
}