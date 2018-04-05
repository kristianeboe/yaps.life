
/**
 * @jest-environment node
 */


const createUserData = require('../utils/createUserData')
const {
  calculateCosineSimScore, normalize, euclidianDistance, calculateSimScoreFromUsersCustom, cosineSimilarityNPM
} = require('../utils/vectorFunctions')


test('Cosine similarity NPM', () => {
  const { kristianVector, antiKristianVector } = createUserData
  const neg = Array(20).fill(-2)
  const almostPos = Array(20).fill(1)
  const pos = Array(20).fill(2)
  const mid = Array(19).fill(0).concat(1)

  // testing very dissimilar users
  let score = cosineSimilarityNPM(kristianVector, antiKristianVector)
  expect(score).toBeLessThan(-0.8)

  // testing normalized dissimilar users
  const normKristian = normalize(kristianVector)
  const normAntiKristian = normalize(antiKristianVector)
  score = cosineSimilarityNPM(normKristian, normAntiKristian)
  expect(score).toBeLessThan(-0.8)

  // Testing completely dissimliar vectors
  score = cosineSimilarityNPM(neg, pos)
  expect(score).toBeLessThan(-0.9)

  // testing equal vectors
  score = cosineSimilarityNPM(neg, neg)
  expect(score).toBeGreaterThan(0.99)

  score = cosineSimilarityNPM(mid, mid)
  expect(score).toBeGreaterThan(0.99)
  score = cosineSimilarityNPM(pos, pos)
  expect(score).toBeGreaterThan(0.99)
  score = cosineSimilarityNPM(almostPos, pos)
  expect(score).toBeGreaterThan(0.8)
  // Still 0.99, hmm
  // expect(score).toBeLessrThan(0.9)
})

test('Cosine sim score', () => {
  const { kristianVector, antiKristianVector } = createUserData
  const neg = Array(20).fill(-2)
  const pos = Array(20).fill(2)
  const almostPos = Array(20).fill(1)
  const mid = Array(19).fill(0).concat(1)
  // testing very dissimilar users
  let score = calculateCosineSimScore(kristianVector, antiKristianVector)
  expect(score).toBeLessThan(0)

  // testing normalization
  const normKristian = normalize(kristianVector)
  const normAntiKristian = normalize(antiKristianVector)
  score = calculateCosineSimScore(normKristian, normAntiKristian)
  expect(score).toBeLessThan(60)

  // Testing completely dissimliar vectors
  score = calculateCosineSimScore(neg, pos)
  expect(score).toBeLessThan(0)

  // testing equal vectors
  score = calculateCosineSimScore(neg, neg)
  score = calculateCosineSimScore(mid, mid)
  score = calculateCosineSimScore(pos, pos)
  expect(score).toBeGreaterThan(98)
  score = cosineSimilarityNPM(almostPos, pos)
})

test('Euclidian distance', () => {
  const { kristianVector, antiKristianVector } = createUserData
  const neg = Array(20).fill(-2)
  const pos = Array(20).fill(2)
  const almostPos = Array(20).fill(1)
  const mid = Array(20).fill(0)
  // testing very dissimilar users
  let score = euclidianDistance(kristianVector, antiKristianVector)
  console.log('testing very dissimilar users', score)
  expect(score).toBeGreaterThan(10)

  // testing normalization
  const normKristian = normalize(kristianVector)
  const normAntiKristian = normalize(antiKristianVector)
  score = euclidianDistance(normKristian, normAntiKristian)
  console.log('// testing normalization', score)
  expect(score).toBeGreaterThan(0)

  // testing completely dissimlar vectors
  score = euclidianDistance(neg, pos)
  console.log('// testing completely dissimlar vectors', score)
  expect(score).toBeGreaterThan(15)

  // testing completely dissimilar normalized vectors
  const normNeg = normalize(neg)
  const normPos = normalize(pos)
  score = euclidianDistance(normNeg, normPos)
  console.log('  // testing completely dissimilar normalized vectors', score)
  expect(score).toBe(2)

  // testing equal vectors
  score = euclidianDistance(pos, pos)
  console.log('// testing equal vectors', score)
  expect(score).toBe(0)

  // testing equal normalized vectors
  score = euclidianDistance(normPos, normPos)
  console.log('// testing equal normalized vectors', score)
  expect(score).toBe(0)

  // Testing semi similar vectors
  score = euclidianDistance(mid, pos)
  console.log('// Testing semi similar vectors', score)

  score = euclidianDistance(almostPos, pos)
  console.log('almost pos', score)
})

/* test('Sim score custom', () => {
  const { me, antiKristianUser } = createUserData
  let score = calculateSimScoreFromUsersCustom(me, antiKristianUser)

  const ones = {}
  for (let q = 0; q < 20; q += 1) {
    ones[`q${q + 1}`] = 1
  }

  const fives = {}
  for (let q = 0; q < 20; q += 1) {
    fives[`q${q + 1}`] = 5
  }

  score = calculateSimScoreFromUsersCustom(ones, fives)

  score = calculateSimScoreFromUsersCustom(ones, ones)
  expect(score).toBe(0)
})
 */
