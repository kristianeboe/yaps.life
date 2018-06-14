
/**
 * @jest-environment node
 */


const admin = require('firebase-admin')

admin.initializeApp()


const createTestData = require('../lib/utils/createTestData')
const { extractVectorsFromUsers } = require('../lib/utils/vectorFunctions')
const {
  knnClustering, knnClusteringOneMatchPerUser, knnClusteringSingleMatchTestUsers
} = require('../lib/clusteringAlgorithms/knnClustering')
const {
  createMatchFromFlatmates, createGroupPropertyVector, calculateAlignment, createFlatmatesFromClusters
} = require('../lib/clusteringAlgorithms/clusteringPipeline')
const { kMeansClustering, dbScanClustering, opticsClustering } = require('../lib/clusteringAlgorithms/kMeansClustering')
const testUsers64 = require('./testUsers64')

const euclidianDistanceSquared = require('euclidean-distance/squared')
const cosineSimilarity = require('compute-cosine-distance')


console.log(testUsers64.length)
const testUsers = testUsers64 // createTestData.createTestUsers(48)

const testFlat = [
  {
    propertyVector: [1, 3, 3, 5],
    personalityVectorSame: [3, 5, 4, 2, 5, 4, 5, 4, 4, 5, 1, 2, 5, 3, 1, 4, 3, 5, 2, 1],
    personalityVector: [3, 5, 4, 2, 5, 4, 5, 4, 4, 5, 1, 2, 5, 3, 1, 4, 3, 5, 2, 1],
  },
  {
    propertyVector: [1, 1, 3, 3],
    personalityVectorSame: [3, 5, 4, 2, 5, 4, 5, 4, 4, 5, 1, 2, 5, 3, 1, 4, 3, 5, 2, 1],
    personalityVector: [1, 4, 4, 1, 3, 1, 2, 5, 2, 1, 2, 4, 5, 2, 2, 1, 5, 4, 5, 2],
  },
  {
    propertyVector: [1, 3, 5, 3],
    personalityVectorSame: [3, 5, 4, 2, 5, 4, 5, 4, 4, 5, 1, 2, 5, 3, 1, 4, 3, 5, 2, 1],
    personalityVector: [5, 4, 1, 4, 4, 1, 4, 1, 1, 1, 4, 5, 1, 4, 2, 2, 2, 5, 1, 1],
  },
  {
    propertyVector: [1, 3, 1, 3],
    personalityVectorSame: [3, 5, 4, 2, 5, 4, 5, 4, 4, 5, 1, 2, 5, 3, 1, 4, 3, 5, 2, 1],
    personalityVector: [5, 5, 2, 1, 2, 5, 3, 3, 5, 1, 2, 5, 3, 4, 1, 1, 2, 5, 4, 1],
  }
]

function getAverageFeatureAcrossMatches(matchArray, field) {
  let averageFeature = 0
  matchArray.forEach((match) => {
    averageFeature += match[field]
  })
  averageFeature /= matchArray.length
  return averageFeature
}

function getMedian(matches, feature) {
  // const matches = matches.slice(0) // create copy
  const middle = (matches.length + 1) / 2
  matches.sort((a, b) => a[feature] - b[feature])
  return (matches.length % 2) ? matches[middle - 1] : (matches[middle - 1.5] + matches[middle - 0.5]) / 2
}


function printScoreCard(algorithmName, matches) {
  const averageMatchScore = getAverageFeatureAcrossMatches(matches, 'personalityAlignment')
  const averagePropertyAlignment = getAverageFeatureAcrossMatches(matches, 'propertyAlignment')
  const averageCombinedAlignment = getAverageFeatureAcrossMatches(matches, 'combinedAlignment')
  const medianMatch = getMedian(matches, 'combinedAlignment')
  const maxMatch = matches.reduce((a, c) => (a.combinedAlignment > c.combinedAlignment ? a : c))
  const minMatch = matches.reduce((a, c) => (a.combinedAlignment < c.combinedAlignment ? a : c))
  return (
    `${algorithmName}`
  + `\n Nr of matches: ${matches.length}`
  // + `\n Worst personality alignment: ${maxMatch.personalityAlignment}`
  + `\n Average personality alignment: ${averageMatchScore}`
  // + `\n Best personality alignment: ${minMatch.personalityAlignment}`
   + `\n Worst property alignment: ${maxMatch.propertyAlignment}`
  + `\n Average property alignment: ${averagePropertyAlignment}`
   + `\n Best property alignment: ${minMatch.propertyAlignment}`
  + `\n Worst combined alignment: ${maxMatch.combinedAlignment}`
  + `\n Average combined alignment: ${averageCombinedAlignment}`
  + `\n Median combined alignment: ${medianMatch.combinedAlignment}`
  + `\n Best combined alignment: ${minMatch.combinedAlignment}`)
}


test('vectorAverageing', () => {
  const groupPropertyVector = createGroupPropertyVector(testFlat)
  expect(groupPropertyVector).toEqual([1, 2.5, 3, 3.5])
})

test('flatScore', () => {
  const personalityAlignment = calculateAlignment(testFlat, 'personalityVector')
  expect(personalityAlignment).toBeGreaterThan(0)
})

test('propertyAlignment', () => {
  const propertyAlignment = calculateAlignment(testFlat, 'propertyVector')
  expect(propertyAlignment).toBeGreaterThanOrEqual(0)
})

test('baseline, bruteforce', async () => {
  const testUsers = createTestData.createTestUsers(16)
  /* const testUsers1 = testUsers.map(mate => ({
    ...mate,
    propertyVector: mate.propertyVector.map((el, index) => (index < 2 ? el * 5 : el * 3))
  })) */
  const matchArray = []
  for (let i = 0; i < testUsers.length; i += 1) {
    const testUser1 = testUsers[i]
    for (let j = 0; j < testUsers.length; j += 1) {
      if (j === i) break
      const testUser2 = testUsers[j]
      for (let k = 0; k < testUsers.length; k += 1) {
        if (k === j) break
        const testUser3 = testUsers[k]
        for (let l = 0; l < testUsers.length; l += 1) {
          if (l === k) break
          const testUser4 = testUsers[l]
          const flatmates = [testUser1, testUser2, testUser3, testUser4]
          const match = await createMatchFromFlatmates(flatmates, false, true)
          matchArray.push(match)
        }
      }
    }
  }
})
/* const weightedMatchArray = matchArray.map(match => ({
    ...match,
    flatmates: match.flatmates.map(mate => ({
      ...mate,
      propertyVector: mate.propertyVector.map((el, index) => (index < 2 ? el * 5 : el * 3))
    }))
  }))
  console.log(printScoreCard('baseline, bruteforce', matchArray))
  expect(matchArray.length).toBeGreaterThan(0)
}) */

/* test('test baseline2', async () => {
  /* const testUsers1 = testUsers.map(mate => ({
    ...mate,
    propertyVector: mate.propertyVector.map((el, index) => (index < 2 ? el * 5 : el * 3))
  }))

  const perChunk = 4
  const clusters = testUsers.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk)
    all[ch] = [].concat((all[ch] || []), one)
    return all
  }, [])

  const matchArray = await Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  console.log(printScoreCard('baseline, divide users without clustering', matchArray))
  /* const weightedMatchArray = matchArray.map(match => ({
    ...match,
    flatmates: match.flatmates.map(mate => ({
      ...mate,
      propertyVector: mate.propertyVector.map((el, index) => (index < 2 ? el * 3 : el * 1.5))
    }))
  }))
}) */

test('kNN Single Match', async () => {
  // const { me } = createTestData
  const me = testUsers.slice(0, 1)
  const vectors = extractVectorsFromUsers(testUsers.slice(1), false)
  const userVector = extractVectorsFromUsers(me, false)[0]
  const topK = knnClusteringSingleMatchTestUsers(userVector, vectors, 4)
  const flatmates = me.concat(topK.map(id => testUsers[id]))
  // flatmates.forEach(mate => console.log(mate.personalityVector, calculateSimilarityScoreBetweenUsers(me, mate)))
  const match = await createMatchFromFlatmates(flatmates, false, true)
  console.log(printScoreCard('kNN Single Match', [match]))
  expect(flatmates.length).toBe(4)
  // const match = createMatchFromFlatmates(flatmates)
  // console.log(match)
})


test('kNN, One Match Per User', async () => {
  // extract question vectors
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClusteringOneMatchPerUser(vectors)
  // organize into flats

  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  const matchArray = await Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  console.log(printScoreCard('kNN, One Match Per User', matchArray))
  expect(clusters.length).toBeGreaterThan(0)
})

test('kNN, all to all', async () => {
  // Create test users
  // extract question vectors
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClustering(vectors, 4)
  // organize into flats
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  const matchArray = await Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  console.log(printScoreCard('kNN, all to all', matchArray))
  expect(clusters.length).toBeGreaterThan(0)
})

test('Clusters with kMeans', async () => {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const kClusters = await kMeansClustering(vectors)
  // expect(clusters.length).toBe(5)

  let clusters = createFlatmatesFromClusters(kClusters)
  // console.log(clusters)
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))


  const matchArray = await Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  console.log(printScoreCard('Clusters with kMeans', matchArray))
  expect(clusters.length).toBeGreaterThan(0)
})

test('Clusters with dbScan', async () => {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const dbClusters = dbScanClustering(vectors)
  // expect(clusters.length).toBe(5)

  let clusters = createFlatmatesFromClusters(dbClusters)
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  const matchArray = await Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  console.log(printScoreCard('Clusters with dbScan', matchArray))
  expect(clusters.length).toBeGreaterThan(0)
})

test('Clusters with OPTICS', async () => {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const opticsClusters = opticsClustering(vectors)
  // expect(clusters.length).toBe(5)

  let clusters = createFlatmatesFromClusters(opticsClusters)
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  const matchArray = await Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  console.log(printScoreCard('Clusters with OPTICS', matchArray))
  expect(clusters.length).toBeGreaterThan(0)
})

/* const frequency = {}
  const seen = new Set()
  clusters.forEach((cluster) => {
    cluster.forEach((ele) => {
      frequency[ele] = frequency[ele] ? frequency[ele] + 1 : 0
      seen.add(ele)
    })
  })
  console.log(frequency)
  console.log(seen.size) */
