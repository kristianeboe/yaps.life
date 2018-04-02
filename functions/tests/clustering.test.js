
/**
 * @jest-environment node
 */


const knnClustering = require('../clustering/knnClustering')
const createUserData = require('../utils/createUserData')
const {
  calculateCosineSimScore, normalize, euclidianDistance, extractVectorsFromUsers, calculateSimScoreFromUsersCustom
} = require('../utils/vectorFunctions')
const { clusterUsers, createFlatmatesFromClusters, calculateFlatAverageScore } = require('../clustering/clusteringAlgorithms')
const uuid = require('uuid')

test('Create test users', () => {
  const testUsers = createUserData.createTestUsers(200)
  expect(testUsers.length).toBe(200)
})

test('Extract vector from user', () => {
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
})

test('Clusters vectors with kNN', () => {
  // Create test users
  const testUsers = createUserData.createTestUsers(16)
  // extract question vectors
  const vectors = extractVectorsFromUsers(testUsers, false)
  expect(vectors.length).toBe(16)
  // Cluster with kNN
  const clusters = knnClustering(vectors, 4, euclidianDistance, false)
  expect(clusters.length).toBe(16)
  // organize into flats
  let allFlatmates = createFlatmatesFromClusters(clusters)
  console.log('flatmates length', allFlatmates.length)
  expect(allFlatmates.length).toBe(16)
  allFlatmates = allFlatmates.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  // Turn flats into matches
  const matchArray = []
  allFlatmates.forEach((flatmates) => {
    const flatAverageScore = calculateFlatAverageScore(flatmates, euclidianDistance)

    const matchUid = uuid.v4()
    const match = {
      uid: matchUid,
      flatmates,
      location: 'Oslo', // remember to change this in the future
      bestOrigin: '',
      flatAverageScore,
      custom: false
    }
    matchArray.push(match)
  })
  console.log(matchArray.length)
  console.log(matchArray[0])
  expect(matchArray.length).toBeGreaterThan(0)
})


/* test('Clusters with kMeans', () => {
  const testUsers = createUserData.createTestUsers(50)
  const vectors = extractVectorsFromUsers(testUsers, false)
  clusterUsers(vectors, false).then((clusters) => {
    console.log(clusters)
    expect(clusters.length).toBe(5)
    let allFlatmates = createFlatmatesFromClusters(clusters)
    console.log(allFlatmates)
    console.log(allFlatmates.length)
    expect(allFlatmates.length).toBeGreaterThanOrEqual(5)
    allFlatmates = allFlatmates.map(flatmates =>
      flatmates.map(id => testUsers[id]))
    allFlatmates.forEach((flat) => {
      calculateFlatAverageScore(flat, euclidianDistance)
      calculateFlatAverageScore(flat, calculateCosineSimScore)
    })
    console.log()
  })
    .catch(err => console.log(err))
}) */
