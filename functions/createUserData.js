// import uuid from 'uuid'
var uuid = require('uuid')
var kMeans = require('node-kmeans')
// var similarity = require('compute-cosine-similarity')

const workplaces = [
  'Netlight AS Oslo',
  'McKinsey Oslo',
  'BCG Oslo',
  'Capra Consulting Oslo',
  'Wilhelmsen ASA',
  'Arkwright consulting',
  'Bekk Oslo',
  'Iterate Oslo',
  'Google Oslo',
  'Fuse Oslo',
  'startuplab oslo',
  'Mesh oslo',
  'Crux Advisers oslo',
  'accenture oslo',
  'veidekke asa oslo',
  'unacast oslo',

]

const universities = ['NTNU', 'UIO', 'NHH', 'Harvard', 'Stanford', 'BI Oslo']

const studyProgrammes = ['Datateknologi', 'IndØk', 'SivilØkonom', 'Maskin', 'EMIL', 'KomTek', 'FysMat', 'Psykologi']
const studyProgrammes2 = {
  'NTNU': ['Datateknologi', 'IndØk','Maskin', 'EMIL', 'KomTek', 'FysMat', 'Psykologi'],
  'UIO': ['Interaksjonsdesign', 'Jus', 'Medisin', 'ØkAd'],
  'NHH': ['SivilØkonom', 'Revisor'],
  'BI Oslo': ['SivilØkonom', 'Revisor', 'ØkAd'],
  'Stanford': ['Computer Science', 'MBA'],
  'Harvard': ['Law', 'Medicine', 'Ethics']
}
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
    const university = universities[Math.floor(Math.random() * Math.floor(universities.length))]
    const studyProgramme = studyProgrammes2[university][Math.floor(Math.random() * Math.floor(studyProgrammes2[university].length))]
    const user = {
      uid: uuid(),
      displayName: 'testUser' + index,
      matchLocation: 'Oslo',
      seeNewUsers: false,
      workplace: workplaces[Math.floor(Math.random() * Math.floor(workplaces.length))],
      photoURL: 'https://placem.at/people?w=290&h=290&random=' + getRandomInt(100),
      university,
      age: Math.floor(Math.random() * 10) + 20,
      tos: true,
      readyToMatch: true,
      gender: genders[Math.floor(Math.random() * Math.floor(genders.length))],
      studyProgramme,
    }
    for (let q = 0; q < 20; q++) {
      user['q' + (q + 1)] = vector[q]
    }
    users.push(user)
  }
  return users
}

exports.cluster = (users, normalizeVectors) => {
  // console.log(users[0])
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
      if (err) reject(err)
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

exports.user1 = {
  age: 28,
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'testUser24',
  gender: 'Jente',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://placem.at/people?w=290&h=290&random=100',
  q1: 4,
  q2: 5,
  q3: 5,
  q4: 4,
  q5: 3,
  q6: 4,
  q7: 3,
  q8: 5,
  q9: 5,
  q10: 2,
  q11: 5,
  q12: 1,
  q13: 2,
  q14: 4,
  q15: 4,
  q16: 4,
  q17: 5,
  q18: 3,
  q19: 5,
  q20: 3,
  readyToMatch: true,
  studyProgramme: 'Test course',
  tos: true,
  uid: '894904c3-c966-48f1-8834-a8bceb789820',
  university: 'NHH',
  workplace: 'McKinsey Oslo',
}

exports.user2 = {
  age: 20,
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'testUser17',
  gender: 'Jente',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://placem.at/people?w=290&h=290&random=100',
  q1: 4,
  q2: 3,
  q3: 5,
  q4: 5,
  q5: 1,
  q6: 4,
  q7: 4,
  q8: 1,
  q9: 4,
  q10: 2,
  q11: 4,
  q12: 1,
  q13: 2,
  q14: 2,
  q15: 4,
  q16: 2,
  q17: 1,
  q18: 5,
  q19: 5,
  q20: 4,
  readyToMatch: true,
  studyProgramme: 'Test course',
  tos: true,
  uid: '93715ce7-5182-49d6-89a9-fda54133a450',
  university: 'NHH',
  workplace: 'BCG Oslo',
}

exports.user3 = {
  age: 27,
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'testUser126',
  gender: 'Gutt',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://placem.at/people?w=290&h=290&random=54',
  q1: 1,
  q2: 4,
  q3: 2,
  q4: 3,
  q5: 2,
  q6: 4,
  q7: 4,
  q8: 2,
  q9: 4,
  q10: 5,
  q11: 2,
  q12: 3,
  q13: 2,
  q14: 2,
  q15: 2,
  q16: 3,
  q17: 4,
  q18: 2,
  q19: 2,
  q20: 5,
  readyToMatch: true,
  studyProgramme: 'Test course',
  tos: true,
  uid: 'be1ca834-458f-4b76-abda-9f28d665d05e',
  university: 'NHH',
  workplace: 'Bekk Oslo',
}

exports.me = {
  age: '25',
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'Kristian Elset Bø',
  gender: 'Gutt',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg',
  q1: 4,
  q2: 4,
  q3: 2,
  q4: 3,
  q5: 4,
  q6: 5,
  q7: 1,
  q8: 2,
  q9: 2,
  q10: 4,
  q11: 1,
  q12: 1,
  q13: 1,
  q14: 2,
  q15: 2,
  q16: 4,
  q17: 5,
  q18: 5,
  q19: 5,
  q20: 3,
  readyToMatch: true,
  studyProgramme: 'Computer Science',
  tos: true,
  uid: 'hWBbCxiigfUISnJ8upb6pnUDfXG3',
  university: 'NTNU',
  workplace: 'Netlight AS Oslo',
}
