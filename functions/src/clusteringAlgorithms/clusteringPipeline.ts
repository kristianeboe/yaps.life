

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
  const u = uData.personalityVector
  const v = vData.personalityVector

  const vectorDistance = euclidianDistanceSquared(u, v)
  const simScore = mapSimScoreToPercentage(vectorDistance)

  return simScore
}


export function calculateAlignment(flatmates, feature, combine=[]) {
  const similarityDistances = []

  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      if (i !== j) {
        const mate2 = flatmates[j]
        if (combine.length > 0) {
          const similarityDistance = euclidianDistanceSquared(mate1[combine[0]].concat(mate1[combine[1]]), mate2[combine[0]].concat(mate2[combine[1]]))
          similarityDistances.push(similarityDistance)
        } else {
          const similarityDistance = euclidianDistanceSquared(mate1[feature], mate2[feature]) // calculateSimilarityScoreBetweenUsers(mate1, mate2)
          similarityDistances.push(similarityDistance)
        }
      }
    }
  }

  let distance = 0
  if (similarityDistances.length > 1) {
    distance = similarityDistances.reduce((a, b) => a + b, 0) / similarityDistances.length
  }
  return Math.floor(distance)
}
export function calculateFlatScore(flatmates) {
  const simScores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const simScore = euclidianDistanceSquared(mate1.personalityVector, mate2.personalityVector) // calculateSimilarityScoreBetweenUsers(mate1, mate2)
        simScores.push(simScore)
      }
    }
  }

  let flatScore = 0
  if (simScores.length > 1) {
    flatScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
  }
  return Math.floor(flatScore)
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
        propScores.push(propScore)// mapPropScoreToPercentage(propScore))
      }
    }
  }

  let propertyAlignment = 0
  if (propScores.length > 1) {
    propertyAlignment = propScores.reduce((a, b) => a + b, 0) / propScores.length
  }
  return Math.floor(propertyAlignment)
}

export function calculateCombinedAlignment(flatmates) {
  const scores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const score = euclidianDistanceSquared(mate1.personalityVector.concat(mate1.propertyVector), mate2.personalityVector.concat(mate2.propertyVector))
        scores.push(score)// mapPropScoreToPercentage(propScore))
      }
    }
  }

  let combinedAlignment = 0
  if (scores.length > 1) {
    combinedAlignment = scores.reduce((a, b) => a + b, 0) / scores.length
  }
  return Math.floor(combinedAlignment)
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
      dateTime: new Date(),
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

export async function matchAllAvailableUsers() {
  const usersToBeMatched = []
  const usersToBeMatchedSnapshot = await admin.firestore().collection('users')
    .where('matchLocation', '==', 'Oslo')
    .where('readyToMatch', '==', true)
    .get()
  usersToBeMatchedSnapshot.forEach(userDoc => {
    const user = userDoc.data()
    usersToBeMatched.push(user)
  })

  console.log(`got ${usersToBeMatched.length} users`)
  if (usersToBeMatched.length < 16) {
    console.log('Not enough users to do a match')
    return false
  }

  // Cluster
  console.log('starting clustering')
  const vectors = extractVectorsFromUsers(usersToBeMatched, false)
  const clusters = await knnClusteringOneMatchPerUser(vectors, 4)
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
    

export async function createMatchFromFlatmates(flatmates, demo=false, test=false, custom=false) {
  const personalityAlignment = calculateAlignment(flatmates, 'personalityVector')
  const propertyAlignment = calculateAlignment(flatmates, 'propertyVector')
  const groupPropertyVector = createGroupPropertyVector(flatmates)
  const combinedAlignment = calculateAlignment(flatmates, '', ['personalityVector', 'propertyVector'])

  const matchUid = uuid.v4()
  const match = {
    title: GROUP_NAMES[flatmates.length][Math.floor(Math.random()*GROUP_NAMES[flatmates.length].length)],
    uid: matchUid,
    flatmates,
    location: 'Oslo', // remember to change this in the future
    bestOrigin: '',
    personalityAlignment,
    propertyAlignment,
    combinedAlignment,
    groupPropertyVector,
    currentListings: {},
    createdAt: new Date(), //yarn  admin.firestore.FieldValue.serverTimestamp(),
    demo,
    test,
    custom
  }
  const matchRef = admin.firestore().collection('matches').doc(matchUid)
  
  if (!test) {
    // Create match
    await matchRef.set(match)
    // init chatroom
    await initChatRoom(matchRef)
  }

  // Update users with new match
  if (demo || custom) {
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
          [`currentMatches.${matchUid}`]: {matchId: matchUid, timeStamp: new Date()},
          newMatches: true,
          gettingCloudMatched: 90,
        })
          .catch(err =>
            console.log('error with updating user with currentMatchId', err)
          )
    })
  ).catch(err => console.log('error with updating users with currentMatchId', err))
} else {
  return match
}
}