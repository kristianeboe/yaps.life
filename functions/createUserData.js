// import uuid from 'uuid'
var uuid = require('uuid')
var kMeans = require('node-kmeans')
// var similarity = require('compute-cosine-similarity')

const workplaces = [
  'Netlight AS',
  'McKinsey',
  'BCG',
  'Capra Consulting',
  'Skatteetaten',
  'Wilhelmsen',
  'Storebrand',
  'Bekk',
  'Iterate',
  'Instagram',
  'Facebook',
  'Google',
  'Airbnb',
  'Uber',
  'The Verge',
  'Fuse',
  'Bysykkel',
]

const universities = ['NTNU', 'UIO', 'NHH', 'Harvard', 'Stanford']

const genders = ['Gutt', 'Jente']

normalize = vector => {
  const magnitude = Math.sqrt(vector.map(el => el * el).reduce((a, b) => a + b, 0))
  const normalized = vector.map(ele => ele / magnitude)
  return normalized
}

getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max)) + 1
}

chunck = (array, c_size) => {
  const chunk_array = []
  for (let index = 0; index < array.length; index += c_size) {
    const chunck = array.slice(index, index + c_size)
    chunk_array.push(chunck)
  }
  return chunk_array
}
countOfLessThan = (n, arrayOfArrays) => {
  let size = 0
  let count = 0
  for (array of arrayOfArrays) {
    size += array.length
    if (array.length < n) {
      count += 1
    }
  }
  return [size, count]
}
exports.createUsers = n => {
  const users = []

  for (let index = 0; index < n; index++) {
    const vector = []
    for (let j = 0; j < 20; j++) {
      vector.push(getRandomInt(5))
    }
    const user = {
      uid: uuid(),
      displayName: 'testUser' + index,
      location: 'Oslo',
      workplace: workplaces[Math.floor(Math.random() * Math.floor(workplaces.length))],
      photoURL: 'https://placem.at/people?w=290&h=290&random='+ getRandomInt(100),
      university: universities[Math.floor(Math.random() * Math.floor(universities.length))],
      age: Math.floor(Math.random() * 10) + 20,
      tos: true,
      readyToMatch: true,
      gender: genders[Math.floor(Math.random() * Math.floor(genders.length))],
      studyProgramme: 'Test course',
    }
    for (let q = 0; q < 20; q++) {
      user['q' + (q + 1)] = vector[q]
    }
    users.push(user)
  }
  return users
}

exports.cluster = (users, normalizeVectors) => {
  console.log(users[0])
  return new Promise((resolve, reject) => {
    let vectors = []
    for (let i = 0; i < users.length; i++) {
      const vector = []
      for (let j = 0; j < 20; j++) {
        users[i]['q' + (j + 1)] ? vector.push(users[i]['q' + (j + 1)]) : vector.push(3)
      }
      vectors[i] = normalizeVectors ? normalize(vector) : vector
    }

    const kmeans = require('node-kmeans')
    // console.log(vectors)
    // distance: (a,b) => similarity(a,b)
    const k = Math.floor(users.length / 4) //users.length > 500 ? 10 : 4
    kmeans.clusterize(vectors, { k: k }, (err, res) => {
      if (err) console.error(err)
      else {
        const clusters = []
        for (const item in res) {
          clusters.push(res[item].clusterInd)
        }

        // console.log('clusters', clusters)
        resolve(clusters)
      }
    })
  })
}

exports.flatMatesFromClusters = (clusters, n) => {
  const flatmates = []
  for (let cluster of clusters) {
    const len = cluster.length
    const modulo4 = len % 4
    if (len == 5 || len < 3) {
      flatmates.push(cluster)
    } else if (modulo4 == 0) {
      chunck(cluster, 4).forEach(mates => flatmates.push(mates))
    } else if (modulo4 == 1) {
      // take out three groups of three
      chunck(cluster.slice(0, 9), 3).forEach(mates => flatmates.push(mates))
      cluster = cluster.slice(9, cluster.length)
      chunck(cluster, 4).forEach(mates => flatmates.push(mates))
    } else if (modulo4 == 2) {
      chunck(cluster.slice(0, 6), 3).forEach(mates => flatmates.push(mates))
      cluster = cluster.slice(6, cluster.length)
      chunck(cluster, 4).forEach(mates => flatmates.push(mates))
    } else if (modulo4 == 3) {
      flatmates.push(cluster.slice(0, 3))
      cluster = cluster.slice(3, cluster.length)
      chunck(cluster, 4).forEach(mates => flatmates.push(mates))
    } else {
      // flatmates.push(cluster)
    }
    // console.log(cluster)
  }

  // console.log('flatmates', flatmates)
  return flatmates
}

// const users = createUsers(20)
// cluster(users, true).then(clusters => {
//   const flatmates = flatMatesFromClusters(clusters, 4)
//   console.log(flatmates)
//   const flats =  flatmates.map(flat => flat.map(id => users[id]))
//   flats.forEach(flat => {
//     // create a match object
// const match = {
//   uid: uuid(),
//   flatMates: flat.map(mate => mate.uid),
//   location: null,
// }
//     firebase.firestore().collection('matches').doc(match.uid).set(match) //.then(doc => doc.ref.collection('messages').add({})
// match.flatMates.forEach(mate => {
//   //firebase.firestore().collection('users').doc(mate).update({currentMatchId: match.uid})
// })
//   })
//   console.log(usersClustered)
//   // console.log(countOfLessThan(3, flatmates))
// })

// const clustersNormalized = cluster(users, true)
// const flatmatesNormalized = flatMatesFromClusters(clustersNormalized)

// const users = createUsers(12)
// const vectors = users.map(user => user.vector)
// console.log(vectors)
// const chunckA = chunck(vectors, 4)
// console.log(chunckA)
