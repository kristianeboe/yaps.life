
/**
 * @jest-environment node
 */
const euclidianDistanceSquared = require('euclidean-distance/squared')


const createTestData = require('../lib/utils/createTestData')
const uuid = require('uuid')
const { knnClustering, knnClusteringOneMatchPerUser, knnClusteringSingleMatchTestUsers } = require('../lib/clusteringAlgorithms/knnClustering')
const { kMeansClustering } = require('../lib/clusteringAlgorithms/kMeansClustering')

const { createMatchFromFlatmates } = require('../lib/clusteringAlgorithms/clusteringPipeline')
const {
  createFlatmatesFromClusters, calculateFlatScore, calculateSimilarityScoreBetweenUsers, calculatePropertyAlignment
} = require('../lib/clusteringAlgorithms/clusteringPipeline')
const { extractVectorsFromUsers } = require('../lib/utils/vectorFunctions')


test('Create test users', () => {
  const testUsers = createTestData.createTestUsers(200)
  expect(testUsers.length).toBe(200)
})


test('User similarity', () => {
  const { me, antiKristianUser } = createTestData
  const neg = { personalityVector: Array(20).fill(-2) }
  const pos = { personalityVector: Array(20).fill(2) }
  const almostPos = { personalityVector: Array(20).fill(1) }
  const mid = { personalityVector: Array(20).fill(0) }

  // testing completely dissimlar vectors
  let score = calculateSimilarityScoreBetweenUsers(neg, pos)
  expect(score).toBeLessThan(1)

  // testing very dissimilar users
  score = calculateSimilarityScoreBetweenUsers(me, antiKristianUser)
  expect(score).toBeLessThan(40)

  // Testing semi similar vectors
  score = calculateSimilarityScoreBetweenUsers(mid, pos)
  expect(score).toBeGreaterThan(70)

  score = calculateSimilarityScoreBetweenUsers(almostPos, pos)
  expect(score).toBeGreaterThan(80)

  // testing equal vectors
  score = calculateSimilarityScoreBetweenUsers(pos, pos)
  expect(score).toBe(100)
})


const testUsers = createTestData.createTestUsers(100)

test('Clustering with random groups', () => {
  const perChunk = 4

  const clusters = testUsers.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk)
    all[ch] = [].concat((all[ch] || []), one)
    return all
  }, [])

  console.log(calculateSimilarityScoreBetweenUsers(testUsers[0], testUsers[32]))
  console.log(calculateSimilarityScoreBetweenUsers(testUsers[0], testUsers[2]))
  console.log(euclidianDistanceSquared(testUsers[0].personalityVector, testUsers[32].personalityVector))
  console.log(euclidianDistanceSquared(testUsers[0].personalityVector, testUsers[2].personalityVector))

  const matches = []
  clusters.forEach((flatmates) => {
    const flatScore = calculateFlatScore(flatmates)
    const propertyAlignment = calculatePropertyAlignment(flatmates)
    const matchUid = uuid.v4()
    const match = {
      uid: matchUid,
      flatmates,
      location: 'Oslo', // remember to change this in the future
      bestOrigin: '',
      flatScore,
      propertyAlignment,
      custom: false
    }
    matches.push(match)
  })

  const averageMatchScore = getAverageMatchScore(matches, 'random')
  const averagePropertyAlignment = getAveragePropertyAlignment(matches, 'random')
  console.log(printScoreCard('Clustering with random groups', matches, averageMatchScore, averagePropertyAlignment))
  expect(averageMatchScore).toBeGreaterThan(0)
})

test('Clusters vectors with kNN', () => {
  // Create test users
  // extract question vectors
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  const clusters = knnClustering(vectors, 4)
  expect(clusters.length).toBe(testUsers.length)
  // organize into flats
  const matches = createMatches(clusters, 'kNN')
  const averageMatchScore = getAverageMatchScore(matches, 'kNN')
  const averagePropertyAlignment = getAveragePropertyAlignment(matches, 'kNN')
  console.log(printScoreCard('Clusters vectors with kNN', matches, averageMatchScore, averagePropertyAlignment))
  expect(averageMatchScore).toBeGreaterThan(70)
})


test('Clusters with kMeans', () => {
  const vectors = extractVectorsFromUsers(testUsers, false)
  kMeansClustering(vectors, false).then((clusters) => {
    // expect(clusters.length).toBe(5)

    const matches = createMatches(clusters, 'kMeans')
    const averageMatchScore = getAverageMatchScore(matches, 'kMeans')
    const averagePropertyAlignment = getAveragePropertyAlignment(matches, 'kMeans')
    console.log(printScoreCard('Clusters with kMeans', matches, averageMatchScore, averagePropertyAlignment))
    expect(averageMatchScore).toBeGreaterThan(70)
  })
    .catch(err => console.log(err))
})


test('knnClusteringOneMatchPerUser', () => {
  // extract question vectors
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  const clusters = knnClusteringOneMatchPerUser(vectors, 4)
  // organize into flats
  const matches = createMatches(clusters)
  const averageMatchScore = getAverageMatchScore(matches)
  const averagePropertyAlignment = getAveragePropertyAlignment(matches)
  console.log(printScoreCard('knnClusteringOneMatchPerUser', matches, averageMatchScore, averagePropertyAlignment))
  expect(averageMatchScore).toBeGreaterThan(70)
})

test('kNNSingleMatch', () => {
  const { me } = createTestData
  const vectors = extractVectorsFromUsers(testUsers, false)
  const userVector = extractVectorsFromUsers([me], false)[0]
  const topK = knnClusteringSingleMatchTestUsers(userVector, vectors, 4)
  const flatmates = [me].concat(topK.map(id => testUsers[id]))
  // flatmates.forEach(mate => console.log(mate.personalityVector, calculateSimilarityScoreBetweenUsers(me, mate)))
  console.log(calculateSimilarityScoreBetweenUsers(flatmates[0], flatmates[1]))
  console.log(calculateSimilarityScoreBetweenUsers(flatmates[0], flatmates[2]))
  console.log(euclidianDistanceSquared(flatmates[0].personalityVector, flatmates[1].personalityVector))
  console.log(euclidianDistanceSquared(flatmates[0].personalityVector, flatmates[2].personalityVector))
  const match = createMatch(flatmates)
  const averageMatchScore = getAverageMatchScore([match])
  const averagePropertyAlignment = getAveragePropertyAlignment([match])
  console.log(printScoreCard('kNNSingleMatch', [match], averageMatchScore, averagePropertyAlignment))
  expect(flatmates.length).toBe(4)
  // const match = createMatchFromFlatmates(flatmates)
  // console.log(match)
})

function createMatch(flatmates) {
  const flatScore = calculateFlatScore(flatmates)
  const propertyAlignment = calculatePropertyAlignment(flatmates)
  const matchUid = uuid.v4()
  const match = {
    uid: matchUid,
    flatmates,
    location: 'Oslo', // remember to change this in the future
    bestOrigin: '',
    flatScore,
    propertyAlignment,
    custom: false
  }
  return match
}
function createMatches(clusters) {
  let allFlatmates = createFlatmatesFromClusters(clusters)
  allFlatmates = allFlatmates.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  // Turn flats into matches
  const matchArray = []
  allFlatmates.forEach((flatmates) => {
    const flatScore = calculateFlatScore(flatmates)
    const propertyAlignment = calculatePropertyAlignment(flatmates)
    const matchUid = uuid.v4()
    const match = {
      uid: matchUid,
      flatmates,
      location: 'Oslo', // remember to change this in the future
      bestOrigin: '',
      flatScore,
      propertyAlignment,
      custom: false
    }
    matchArray.push(match)
  })
  return matchArray
  // expect(matchArray.length).toBe(4)
}

function getAverageMatchScore(matchArray) {
  let averageMatchScore = 0
  matchArray.forEach((match) => {
    averageMatchScore += match.flatScore
  })
  averageMatchScore /= matchArray.length
  return averageMatchScore
}

function getAveragePropertyAlignment(matchArray) {
  let averagePropertyAlignment = 0
  matchArray.forEach((match) => {
    averagePropertyAlignment += match.propertyAlignment
  })
  averagePropertyAlignment /= matchArray.length
  return averagePropertyAlignment
}

function printScoreCard(algorithmName, matches, averageMatchScore, averagePropertyAlignment) {
  return `${algorithmName}\n Nr of matches: ${matches.length}\n Average mach score: ${averageMatchScore}\n Average property alignment: ${averagePropertyAlignment}`
}
