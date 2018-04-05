
/**
 * @jest-environment node
 */


const uuid = require('uuid')
const knnClustering = require('../clusteringAlgorithms/knnClustering')
const kMeansClustering = require('../clusteringAlgorithms/kMeansClustering')
const createUserData = require('../utils/createUserData')
const { createFlatmatesFromClusters, calculateFlatScore, calculateSimilarityScoreBetweenUsers } = require('../clusteringAlgorithms/clusteringPipeline')
const { extractVectorsFromUsers } = require('../utils/vectorFunctions')

test('Create test users', () => {
  const testUsers = createUserData.createTestUsers(200)
  expect(testUsers.length).toBe(200)
})


test('User similarity', () => {
  const { me, antiKristianUser } = createUserData
  const neg = { answerVector: Array(20).fill(-2) }
  const pos = { answerVector: Array(20).fill(2) }
  const almostPos = { answerVector: Array(20).fill(1) }
  const mid = { answerVector: Array(20).fill(0) }

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


/* test('Extract vector from user', () => {
  const testUsers = createUserData.createTestUsers(1)
  const vectorsNormalized = extractVectorsFromUsers(testUsers, true)
  expect(vectorsNormalized.length).toBe(1)
  const vectorNormalized = vectorsNormalized[0]
  expect(vectorNormalized.length).toBe(20)
  vectorNormalized.forEach((index) => {
    expect(index).toBeGreaterThan(0)
    expect(index).toBeLessThan(1)
  })
  const vectors = extractVectorsFromUsers(testUsers, false)
  expect(vectors.length).toBe(1)
  const vector = vectors[0]
  expect(vector.length).toBe(20)
  vector.forEach((index) => {
    expect(index).toBeGreaterThan(0)
    expect(index).toBeLessThan(6)
  })
}) */

test('Clusters vectors with kNN', () => {
  // Create test users
  const testUsers = createUserData.createTestUsers(500)
  expect(testUsers.length).toBe(500)
  // extract question vectors
  const vectors = extractVectorsFromUsers(testUsers, false)
  expect(vectors.length).toBe(500)
  // Cluster with kNN
  const clusters = knnClustering(vectors, 4)
  expect(clusters.length).toBe(500)
  // organize into flats
  let allFlatmates = createFlatmatesFromClusters(clusters)
  expect(allFlatmates.length).toBe(500)
  allFlatmates.forEach((flat) => {
    expect(flat.length).toBe(4)
  })
  allFlatmates = allFlatmates.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  // Turn flats into matches
  const matchArray = []
  allFlatmates.forEach((flatmates) => {
    const flatScore = calculateFlatScore(flatmates)

    const matchUid = uuid.v4()
    const match = {
      uid: matchUid,
      flatmates,
      location: 'Oslo', // remember to change this in the future
      bestOrigin: '',
      flatScore,
      custom: false
    }
    matchArray.push(match)
  })
  expect(matchArray.length).toBe(500)
  let averageMatchScore = 0
  matchArray.forEach((match) => {
    averageMatchScore += match.flatScore
  })
  averageMatchScore /= matchArray.length
  console.log(averageMatchScore)
  expect(averageMatchScore).toBeGreaterThan(75)
})


test('Clusters with kMeans', () => {
  const testUsers = createUserData.createTestUsers(500)
  const vectors = extractVectorsFromUsers(testUsers, false)
  kMeansClustering(vectors, false).then((clusters) => {
    expect(clusters.length).toBe(5)
    let allFlatmates = createFlatmatesFromClusters(clusters)
    expect(allFlatmates.length).toBeGreaterThanOrEqual(5)
    allFlatmates = allFlatmates.map(flatmates =>
      flatmates.map(id => testUsers[id]))

    const matchArray = []
    allFlatmates.forEach((flatmates) => {
      const flatScore = calculateFlatScore(flatmates)

      const matchUid = uuid.v4()
      const match = {
        uid: matchUid,
        flatmates,
        location: 'Oslo', // remember to change this in the future
        bestOrigin: '',
        flatScore,
        custom: false
      }
      matchArray.push(match)
    })
    let averageMatchScore = 0
    matchArray.forEach((match) => {
      averageMatchScore += match.flatScore
    })
    averageMatchScore /= matchArray.length
    console.log(averageMatchScore)
    expect(averageMatchScore).toBeGreaterThan(70)
  })
    .catch(err => console.log(err))
})
