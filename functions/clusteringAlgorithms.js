const kMeans = require('node-kmeans')
const admin = require('firebase-admin')
const uuid = require('uuid')
const { calculateSimScoreFromUsers, extractVectorsFromUsers } = require('./utils/vectorFunctions')
const knnClustering = require('./knnClustering')

function chunckArray(array, cSize) {
  const chunkArray = []
  for (let index = 0; index < array.length; index += cSize) {
    const chunck = array.slice(index, index + cSize)
    chunkArray.push(chunck)
  }
  return chunkArray
}


function calculateFlatAverageScore(flat) {
  const simScores = []
  for (let i = 0; i < flat.length; i += 1) {
    const mate1 = flat[i]
    for (let j = 0; j < flat.length; j += 1) {
      const mate2 = flat[j]
      if (i !== j) {
        const simScore = calculateSimScoreFromUsers(mate1, mate2)
        simScores.push(simScore)
      }
    }
  }

  let flatAverageScore = 100
  if (simScores.length > 1) {
    flatAverageScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
  }
  return flatAverageScore
}

function clusterUsers(users, normalizeVectors) {
  // console.log(users[0])
  return new Promise((resolve, reject) => {
    const vectors = extractVectorsFromUsers(users, normalizeVectors)

    if (true) {
      const clusters = knnClustering(vectors, 4)
      resolve(clusters)
      return
    }

    // console.log(vectors)
    // distance: (a,b) => similarity(a,b)
    const k = Math.floor(users.length / 4) // users.length > 500 ? 10 : 4
    kMeans.clusterize(vectors, { k }, (err, res) => {
      if (err) reject(err)
      else {
        const clusters = []
        Object.keys(res).forEach((item) => {
          clusters.push(res[item].clusterInd)
        })
        console.log(`created ${clusters.length} clusters`)
        resolve(clusters)
      }
      // console.log('clusters', clusters)
    })
  })
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

function matchAllAvailableUsers() {
  const usersToBeMatched = []
  console.log('Getting test users')
  admin
    .firestore()
    .collection('testUsers')
    .where('matchLocation', '==', 'Oslo')
    .where('readyToMatch', '==', true)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const testUser = doc.data()
        usersToBeMatched.push(testUser)
      })
      console.log(`got ${usersToBeMatched.length} test users`)
    })
    .then(() => {
      console.log('getting real users')
      const usersRef = admin.firestore().collection('users')
      return Promise.all([usersRef.doc('PmzsNVCnUSMVSMu2WGRa4omxez52').get()])
        .then((results) => {
          results.forEach((doc) => {
            const realUser = doc.data()
            usersToBeMatched.push(realUser)
          })
          console.log(`got ${results.length} real users`)
        })
        .catch(err => err)
    })
    .then(() => {
      console.log(`${usersToBeMatched.length} will be matched`)
      console.log('starting clustering')
      return clusterUsers(usersToBeMatched, false)
    })
    .then((clusters) => {
      console.log('Organizing into flats')
      let allFlatmates = createFlatmatesFromClusters(clusters)
      console.log('flatmates length', allFlatmates.length)
      allFlatmates = allFlatmates.map(flatmates =>
        flatmates.map(id => usersToBeMatched[id]))
      allFlatmates.forEach((flatmates) => {
        const flatAverageScore = calculateFlatAverageScore(flatmates)

        const matchUid = uuid.v4()
        const match = {
          uid: matchUid,
          flatmates,
          location: 'Oslo', // remember to change this in the future
          bestOrigin: '',
          flatAverageScore,
          custom: false
        }
        const matchRef = admin
          .firestore()
          .collection('matches')
          .doc(matchUid)

        matchRef
          .set(match)
          /* .then(() => {
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
          })
          .catch(err => console.log('error with creating match', err)) // .then(doc => doc.ref.collection('messages').add({}) */
        match.flatmates.forEach((mate) => {
          let collectionName = 'testUsers'
          if (mate.uid === 'PmzsNVCnUSMVSMu2WGRa4omxez52') {
            collectionName = 'users'
          }
          admin
            .firestore()
            .collection(collectionName)
            .doc(mate.uid)
            .update({
              currentMatchId: match.uid,
              [`currentMatches.${matchUid}`]: Date.now(),
              readyToMatch: false,
              newMatch: true
            })
            .catch(err =>
              console.log('error with updating user with currentMatchId', err))
        })
      })
      return 'Operation complete'
    })
    .catch(error => console.log('Error in creating matches', error))
}

module.exports.clusterUsers = clusterUsers
module.exports.createFlatmatesFromClusters = createFlatmatesFromClusters
module.exports.matchAllAvailableUsers = matchAllAvailableUsers
