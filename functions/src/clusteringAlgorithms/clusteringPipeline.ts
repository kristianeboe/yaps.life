

import * as admin from 'firebase-admin'
import * as uuid from 'uuid'
const euclidianDistanceSquared = require('euclidean-distance/squared')
const euclidianDistance = require('euclidean-distance')
const cosineDistance = require('compute-cosine-distance')
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


export function calculateAlignment(flatmates, feature, combine=[], similarityFunction=euclidianDistanceSquared) {
  const similarities = []

  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      if (i !== j) {
        const mate2 = flatmates[j]
        let similarity = 0
        if (combine.length > 0) {
           similarity = similarityFunction(mate1[combine[0]].concat(mate1[combine[1]]), mate2[combine[0]].concat(mate2[combine[1]]))
        } else {
           similarity = similarityFunction(mate1[feature], mate2[feature])
        }
        similarities.push(similarity  >= 0 ? similarity : 0)
      }
    }
  }

  let distance = 0
  if (similarities.length > 1) {
    distance = similarities.reduce((a, b) => a + b) / similarities.length
  }
  return distance
}




export function mapPropScoreToPercentage(propScore) {
  return Math.floor((1 - (propScore / 48)) * 100)
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
  const locationBuckets = {}
  const usersToBeMatchedSnapshot = await admin.firestore().collection('users')
    .where('readyToMatch', '==', true)
    .get()
    //.where('matchLocation', '==', 'Oslo')
  usersToBeMatchedSnapshot.forEach(userDoc => {
    const user = userDoc.data()
    if (Object.keys(locationBuckets).includes(user.location)) {
      locationBuckets[user.location] = locationBuckets[user.location].concat(user)
    }
  })
  const matchesInLocations = await Promise.all(Object.keys(locationBuckets).map(async (location) => {
    const usersToBeMatched = locationBuckets[location]
    console.log(`Location: ${location} got ${usersToBeMatched.length} users to be matched`)
    if (usersToBeMatched.length < 4) {
      console.log('Not enough users to do a match')
      return false
    }
  
    // Cluster
    console.log('starting clustering')

    // Extract vectors from users
    const vectors = extractVectorsFromUsers(usersToBeMatched, false, true)
    // Get intital clusters of user indexes
    const kMeansClusters = await kMeansClustering(vectors)
    /* 
    [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18]
    ]
     */

    const usersToBeMatchedClustered = []
    // Map initial clusters back to user ojects from indexes
    //const usersToBeMatchedClustered = kMeansClusters.map(c =>c.map(id => usersToBeMatched[id]))
    /* 
    [
      [user1, user2, user3, user4, user5, user6, user7, user8],
      [user9, user10, user11, user12],
      [user13, user14, user15, user16, user17, user18],
    ]
    */
    
    // For each initial cluster
    const clustersOfClusters = usersToBeMatchedClustered.map( (kMeansCluster) => {
      // Extract vectors again
      const vectorsV2 = extractVectorsFromUsers(kMeansCluster, false, true)
      // Pass them into the kNN algorithm and get the final groups of 2,3,4 or 5
      const kNNClusters = knnClusteringOneMatchPerUser(vectorsV2, cosineDistance)
      // [[1, 2, 3, 4], [5, 6, 7, 8]],
      // Map these clustered indexes back to user objects
      const clustersV2 = kNNClusters.map(flatmates =>
        flatmates.map(id => kMeansCluster[id]))
      return clustersV2
      })

    /* 
    [
      [[user1, user2, user3, user4], [user5, user6, user7, user8]],
      [[user9, user10, user11, user12]],
      [[user13, user14, user15], [user16, user17, user18]],
    ]
    */
   
    // flatten this list 
    const groups = [].concat.apply([], clustersOfClusters)
    // Create matches from groups
    return Promise.all(groups.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
/* 

    const clusters = await knnClusteringOneMatchPerUser(vectors, 4)
    // console.log(`${clusters.length} clusters created`)
    
    // Turn clusters into flats
    console.log('Organizing into flats')
    let listOfFlatmates = createFlatmatesFromClusters(clusters)
    
    console.log('all flatmates length', listOfFlatmates.length)
    listOfFlatmates = listOfFlatmates.map(flatmates => flatmates.map(id => usersToBeMatched[id]))
  
    return Promise.all(
      listOfFlatmates.map(flatmates => createMatchFromFlatmates(flatmates))
    ) */
  }))


}
    

export async function createMatchFromFlatmates(flatmates, demo=false, test=false, custom=false) {

  const flatmatesAlign = flatmates.map(mate => {
    return {
      ...mate,
      personalityVector: [mate.personalityVector.slice(0,6).reduce((a,b) => a+b), mate.personalityVector.slice(6,11).reduce((a,b) => a+b), mate.personalityVector.slice(11,15).reduce((a,b) => a+b), mate.personalityVector.slice(15,20).reduce((a,b) => a+b)]
    }
  })

  const personalityAlignment = calculateAlignment(flatmatesAlign, 'personalityVector', [], cosineDistance)
  const propertyAlignment = calculateAlignment(flatmatesAlign, 'propertyVector', [], cosineDistance)
  const combinedAlignment = calculateAlignment(flatmatesAlign, '', ['personalityVector', 'propertyVector'], cosineDistance)
  const groupPropertyVector = createGroupPropertyVector(flatmatesAlign)

  const alignments = {
    euclideanDistance: {
      personalityAlignment : calculateAlignment(flatmatesAlign, 'personalityVector', [], euclidianDistance),
      propertyAlignment : calculateAlignment(flatmatesAlign, 'propertyVector', [], euclidianDistance),
      combinedAlignment : calculateAlignment(flatmatesAlign, '', ['personalityVector', 'propertyVector'], euclidianDistance),
    },
    euclidianDistanceSquared: {
      personalityAlignment: calculateAlignment(flatmatesAlign, 'personalityVector', [], euclidianDistanceSquared),
      propertyAlignment: calculateAlignment(flatmatesAlign, 'propertyVector', [], euclidianDistanceSquared),
      combinedAlignment: calculateAlignment(flatmatesAlign, '', ['personalityVector', 'propertyVector'], euclidianDistanceSquared),
    },
    cosineDistance: {
      personalityAlignment : calculateAlignment(flatmatesAlign, 'personalityVector', [], cosineDistance),
      propertyAlignment : calculateAlignment(flatmatesAlign, 'propertyVector', [], cosineDistance),
      combinedAlignment : calculateAlignment(flatmatesAlign, '', ['personalityVector', 'propertyVector'], cosineDistance),
    },

  }

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
    custom,
    alignments
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