

import * as admin from 'firebase-admin'
import * as uuid from 'uuid'
const euclidianDistanceSquared = require('euclidean-distance/squared')
import {extractVectorsFromUsers } from '../utils/vectorFunctions'
import { knnClustering, knnClusteringOneMatchPerUser } from './knnClustering'
import  {kMeansClustering} from './kMeansClustering'
import { GROUP_NAMES } from '../utils/constants';


export function mapSimScoreToPercentage(simScore) {
  return Math.floor((1 - (simScore / 320)) * 100)
}

export function calculateSimilarityScoreBetweenUsers(uData, vData) {
  const u = uData.answerVector
  const v = vData.answerVector

  const vectorDistance = euclidianDistanceSquared(u, v)
  const simScore = mapSimScoreToPercentage(vectorDistance)

  return simScore
}

export function calculateFlatScore(flatmates) {
  const simScores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const simScore = calculateSimilarityScoreBetweenUsers(mate1, mate2)
        simScores.push(simScore)
      }
    }
  }

  let flatScore = 100
  if (simScores.length > 1) {
    flatScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
  }
  return Math.floor(flatScore)
}

export function createGroupPropertyVector(flatmates) {
  const groupVector = []
  const propertyVectors = flatmates.map(mate => mate.propertyVector)
  for (let i = 0; i < propertyVectors[0].length; i += 1) {
    let sum = 0
    for (let j = 0; j < flatmates.length; j += 1) {
      sum += propertyVectors[j][i]
    }
    groupVector.push(sum / propertyVectors.length)
  }
  return groupVector
}

export function mapPropScoreToPercentage(propScore) {
  return Math.floor((1 - (propScore / 48)) * 100)
}

export function calculatePropertyAlignment(flatmates) {
  const propScores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const propScore = euclidianDistanceSquared(mate1.propertyVector, mate2.propertyVector)
        propScores.push(mapPropScoreToPercentage(propScore))
      }
    }
  }

  let propertyAlignment = 100
  if (propScores.length > 1) {
    propertyAlignment = propScores.reduce((a, b) => a + b, 0) / propScores.length
  }
  return Math.floor(propertyAlignment)
}

export function chunckArray(array, cSize) {
  const chunkArray = []
  for (let index = 0; index < array.length; index += cSize) {
    const chunck = array.slice(index, index + cSize)
    chunkArray.push(chunck)
  }
  return chunkArray
}


export function createFlatmatesFromClusters(clusters) {
  const allFlatmates = []
  clusters.forEach((cluster) => {
    const len = cluster.length
    const modulo4 = len % 4
    if (len === 5 || len < 3) {
      allFlatmates.push(cluster)
    } else if (modulo4 === 0) {
      chunckArray(cluster, 4).forEach(flatmates => allFlatmates.push(flatmates))
    } else if (modulo4 === 1) {
      // take out three groups of three
      chunckArray(cluster.slice(0, 9), 3).forEach(flatmates =>
        allFlatmates.push(flatmates))
      const clusterSlice = cluster.slice(9, cluster.length)
      chunckArray(clusterSlice, 4).forEach(flatmates =>
        allFlatmates.push(flatmates))
    } else if (modulo4 === 2) {
      chunckArray(cluster.slice(0, 6), 3).forEach(flatmates =>
        allFlatmates.push(flatmates))
      const clusterSlice = cluster.slice(6, cluster.length)
      chunckArray(clusterSlice, 4).forEach(flatmates =>
        allFlatmates.push(flatmates))
    } else if (modulo4 === 3) {
      allFlatmates.push(cluster.slice(0, 3))
      const clusterSlice = cluster.slice(3, cluster.length)
      chunckArray(clusterSlice, 4).forEach(flatmates =>
        allFlatmates.push(flatmates))
    }
  })

  return allFlatmates
}

export function initChatRoom(matchRef) {
  return matchRef
    .collection('messages')
    .add({
      text: 'Stay civil in the chat guys',
      dateTime: Date.now(),
      from: {
        uid: 'admin',
        displayName: 'Admin',
        photoURL:
            'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg'
      }
    })
    .catch(err =>
      console.log('error adding original message to match', err))
}

export async function matchAllAvailableUsers(userUid) {
  console.log('Getting test users')
  const usersToBeMatched = await admin.firestore().collection('testUsers')
    .where('matchLocation', '==', 'Oslo')
    // .where('readyToMatch', '==', true)
    .get()
    .then((snapshot) => {
      const testUsers = []
      snapshot.forEach((doc) => {
        const testUser = doc.data()
        testUsers.push(testUser)
      })
      return testUsers
    }).catch(err => {console.log(err)
    return []} )

  console.log(`got ${usersToBeMatched.length} test users`)
  if (usersToBeMatched.length < 10) {
    console.log('Not enough users to do a match')
    return []
  }
  console.log('getting real users')

  const usersRef = admin.firestore().collection('users')
  console.log(userUid)
  const results = await Promise.all([usersRef.doc(userUid).get()])
  console.log(`got ${results.length} real users`)
  results.forEach((doc) => {
    const realUser = doc.data()
    usersToBeMatched.push(realUser)
  })
  console.log(`${usersToBeMatched.length} will be matched`)
  
  // Cluster
  console.log('starting clustering')
  const vectors = extractVectorsFromUsers(usersToBeMatched, false)
  const clusters = await kMeansClustering(vectors)
  // console.log(`${clusters.length} clusters created`)
  
  // Turn clusters into flats
  console.log('Organizing into flats')
  let listOfFlatmates = createFlatmatesFromClusters(clusters)
  
  console.log('all flatmates length', listOfFlatmates.length)
  listOfFlatmates = listOfFlatmates.map(flatmates => flatmates.map(id => usersToBeMatched[id]))

  return Promise.all(
    listOfFlatmates.map(flatmates => createMatchFromFlatmates(flatmates))
  )

}
    
/*             })
            
          
        })).then((results) => {
          console.log(`${results.length} matches created`)
          return resolve('Operation complete')
        })
      })
      .catch(error => console.log('Error in creating matches', error) || reject(error))
  })
}
 */
export async function createMatchFromFlatmates(flatmates) {
  const flatScore = calculateFlatScore(flatmates)
  const propertyAlignment = calculatePropertyAlignment(flatmates)
  const groupPropertyVector = createGroupPropertyVector(flatmates)

  const matchUid = uuid.v4()
  const match = {
    title: GROUP_NAMES[Math.floor(Math.random()*GROUP_NAMES.length)],
    uid: matchUid,
    flatmates,
    location: 'Oslo', // remember to change this in the future
    bestOrigin: '',
    flatScore,
    propertyAlignment,
    groupPropertyVector,
    propertyList: [],
    custom: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
  const matchRef = admin.firestore().collection('matches').doc(matchUid)
  
  // Create match
  await matchRef.set(match)
  // init chatroom
  await initChatRoom(matchRef)

  // Update users with new match
  return Promise.all(
    match.flatmates.map((mate) => {
      let collectionName = 'testUsers'
      if (mate.uid.length === 28) {
        collectionName = 'users'
      }
      return admin
        .firestore()
        .collection(collectionName)
        .doc(mate.uid)
        .update({
          [`currentMatches.${matchUid}`]: Date.now(),
          readyToMatch: false,
          newMatch: true,
          gettingCloudMatched: false,
        })
          .catch(err =>
            console.log('error with updating user with currentMatchId', err)
          )
    })
  ).catch(err => console.log('error with updating users with currentMatchId', err))
}