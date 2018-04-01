
/**
 * @jest-environment node
 */


const knnClustering = require('../knnClustering')
const createUserData = require('../createUserData')
const {
  calculateCosineSimScore, normalize, euclidianDistance, extractVectorsFromUsers, calculateSimScoreFromUsersCustom
} = require('../utils/vectorFunctions')
// const sum = require('./sum');

/* test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
   */

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

/* test('Clusters vectors with kNN', () => {
  const testUsers = createUserData.createTestUsers(20)
  const vectors = extractVectorsFromUsers(testUsers, true)
  expect(vectors.length).toBe(20)
  const clusters = knnClustering(vectors, 4)
  expect(clusters.length).toBe(20)
})
 */
