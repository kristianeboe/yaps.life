

const admin = require('firebase-admin')
const uuid = require('uuid')
const euclidianDistanceSquared = require('euclidean-distance/squared')
const { extractVectorsFromUsers } = require('../utils/vectorFunctions')
// const knnClustering = require('./knnClustering')
const kMeansClustering = require('./kMeansClustering')


function mapSimScoreToPercentage(simScore) {
  return Math.floor((1 - (simScore / 320)) * 100)
}

function calculateSimilarityScoreBetweenUsers(uData, vData) {
  const u = uData.answerVector
  const v = vData.answerVector

  const vectorDistance = euclidianDistanceSquared(u, v)
  const simScore = mapSimScoreToPercentage(vectorDistance)

  return simScore
}

function calculateFlatScore(flatmates) {
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

function createGroupPropertyVector(flatmates) {
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

function mapPropScoreToPercentage(propScore) {
  return Math.floor((1 - (propScore / 48)) * 100)
}

function calculatePropertyAlignment(flatmates) {
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

function chunckArray(array, cSize) {
  const chunkArray = []
  for (let index = 0; index < array.length; index += cSize) {
    const chunck = array.slice(index, index + cSize)
    chunkArray.push(chunck)
  }
  return chunkArray
}


function createFlatmatesFromClusters(clusters) {
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

function initChatRoom(matchRef) {
  matchRef
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

function matchAllAvailableUsers(userUid) {
  return new Promise((resolve, reject) => {
    const usersToBeMatched = []
    // Get test users
    console.log('Getting test users')
    return admin
      .firestore()
      .collection('testUsers')
      .where('matchLocation', '==', 'Oslo')
      // .where('readyToMatch', '==', true)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const testUser = doc.data()
          usersToBeMatched.push(testUser)
        })
        console.log(`got ${usersToBeMatched.length} test users`)
        if (usersToBeMatched.length < 10) {
          console.log('Not enough users to do a match')
          return false
        }
        return true
      })
      .then(() => {
        // Get real users
        console.log('getting real users')
        const usersRef = admin.firestore().collection('users')
        console.log(userUid)
        return Promise.all([usersRef.doc(userUid).get()])
      })
      .then((results) => {
        results.forEach((doc) => {
          const realUser = doc.data()
          usersToBeMatched.push(realUser)
        })
        console.log(`got ${results.length} real users`)
        return results
      })
      .then(() => {
        // Cluster users
        console.log(`${usersToBeMatched.length} will be matched`)
        console.log('starting clustering')
        const vectors = extractVectorsFromUsers(usersToBeMatched, false)
        /* if (false) {
          return knnClustering(vectors, 4)
        } */
        return kMeansClustering(vectors, false)
      })
      .then((clusters) => {
        console.log(`${clusters.length} clusters created`)
        // Turn clusters into flats
        console.log('Organizing into flats')
        let allFlatmates = createFlatmatesFromClusters(clusters)
        console.log('all flatmates length', allFlatmates.length)
        allFlatmates = allFlatmates.map(flatmates =>
          flatmates.map(id => usersToBeMatched[id]))
        return allFlatmates
      })
      .then((allFlatmates) => {
        // Turn flats into matches
        const matchArray = []
        return Promise.all(allFlatmates.map((flatmates) => {
          const flatScore = calculateFlatScore(flatmates)
          const propertyAlignment = calculatePropertyAlignment(flatmates)
          const groupPropertyVector = createGroupPropertyVector(flatmates)

          const matchUid = uuid.v4()
          const match = {
            uid: matchUid,
            flatmates,
            location: 'Oslo', // remember to change this in the future
            bestOrigin: '',
            flatScore,
            propertyAlignment,
            groupPropertyVector,
            custom: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }

          matchArray.push(match)

          const matchRef = admin
            .firestore()
            .collection('matches')
            .doc(matchUid)

          // init chatroom
          return matchRef
            .set(match)
            .then(() => {
              // initChatRoom(matchRef)
            }).then(() => {
              match.flatmates.forEach((mate) => {
                let collectionName = 'testUsers'
                if (mate.uid === userUid) {
                  collectionName = 'users'
                }
                admin
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
                    console.log('error with updating user with currentMatchId', err))
              })
            })
            .catch(err => console.log('error with creating match', err)) // .then(doc => doc.ref.collection('messages').add({})
          // Update users with new match
        })).then((results) => {
          console.log(`${results.length} matches created`)
          return resolve('Operation complete')
        })
      })
      .catch(error => console.log('Error in creating matches', error) || reject(error))
  })
}

module.exports.createFlatmatesFromClusters = createFlatmatesFromClusters
module.exports.matchAllAvailableUsers = matchAllAvailableUsers
module.exports.calculateFlatScore = calculateFlatScore
module.exports.calculateSimilarityScoreBetweenUsers = calculateSimilarityScoreBetweenUsers
module.exports.createGroupPropertyVector = createGroupPropertyVector
