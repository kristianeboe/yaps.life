
/**
 * @jest-environment node
 */


const createUserData = require('../createUserData')
const {
  calculateCosineSimScore, normalize, euclidianDistance, calculateSimScoreFromUsersCustom
} = require('../utils/vectorFunctions')

test('Cosine sim score', () => {
  const { kristianVector, antiKristianVector } = createUserData
  // testing very dissimilar users
  let score = calculateCosineSimScore(kristianVector, antiKristianVector)
  expect(score).toBeLessThan(60)

  // testing normalization
  const normKristian = normalize(kristianVector)
  const normAntiKristian = normalize(antiKristianVector)
  score = calculateCosineSimScore(normKristian, normAntiKristian)
  expect(score).toBeLessThan(60)

  // Testing completely dissimliar vectors
  const onesU = new Array(20 + 1).join('1').split('').map(parseFloat)
  const fivesV = new Array(20 + 1).join('5').split('').map(parseFloat)
  score = calculateCosineSimScore(onesU, fivesV)
  // expect(score).toBeLessThan(60)

  // testing equal vectors
  expect(onesU.length).toBe(20)
  const onesV = new Array(20 + 1).join('1').split('').map(parseFloat)
  score = calculateCosineSimScore(onesU, onesV)
  expect(score).toBeGreaterThan(98)
})

test('Euclidian distance', () => {
  const { kristianVector, antiKristianVector } = createUserData
  // testing very dissimilar users
  let score = euclidianDistance(kristianVector, antiKristianVector)
  expect(score).toBeGreaterThan(10)
  // testing normalization
  const normKristian = normalize(kristianVector)
  const normAntiKristian = normalize(antiKristianVector)
  score = euclidianDistance(normKristian, normAntiKristian)
  expect(score).toBeGreaterThan(0)

  // testing completely dissimlar vectors
  const onesU = new Array(20 + 1).join('1').split('').map(parseFloat)
  const fivesV = new Array(20 + 1).join('5').split('').map(parseFloat)
  score = euclidianDistance(onesU, fivesV)
  expect(score).toBeGreaterThan(15)
  const normUdifferent = normalize(onesU)
  const normVdifferent = normalize(fivesV)
  score = euclidianDistance(normUdifferent, normVdifferent)
  expect(score).toBe(0)

  // testing equal vectors
  const u = new Array(20 + 1).join('1').split('').map(parseFloat)
  expect(u.length).toBe(20)
  const onesV = new Array(20 + 1).join('1').split('').map(parseFloat)
  score = euclidianDistance(u, onesV)
  expect(score).toBe(0)

  // testing equal normalized vectors
  const normUsimilar = normalize(u)
  const normVsimilar = normalize(onesV)
  score = euclidianDistance(normUsimilar, normVsimilar)
  expect(score).toBe(0)
})

test('Sim score custom', () => {
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
