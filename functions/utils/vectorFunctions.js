/* const cosineSimilarityNPMfunction = require('compute-cosine-similarity')
const euclidianDistance = require('euclidean-distance')
const euclidianDistanceSquared = require('euclidean-distance/squared')

 */
function normalize(vector) {
  const magnitude = Math.sqrt(vector.map(el => el * el).reduce((a, b) => a + b, 0))
  const normalized = vector.map(ele => ele / magnitude)
  return normalized
}
function extractVectorsFromUsers(users, normalizeVectors) {
  const userVectors = []
  for (let i = 0; i < users.length; i += 1) {
    const vector = []
    for (let j = 0; j < 20; j += 1) {
      if (users[i][`q${j + 1}`]) {
        vector.push(users[i][`q${j + 1}`])
      } else {
        vector.push(3)
      }
    }
    userVectors[i] = normalizeVectors ? normalize(vector) : vector
  }
  return userVectors
}
/*
calculateSimilarityScoreBetweenUsers = (uData, vData) => {
  const u = []
  const v = []

  for (let q = 0; q < 20; q += 1) {
    u.push(uData[`q${q + 1}`])
    v.push(vData[`q${q + 1}`])
  }

  return euclidianDistanceSquared(uData.answerVector, vData.answerVector)
}

function mapSimScoreToPercentage(simScore) {
  return Math.floor((1 - (simScore / 320)) * 100)
}


calculateFlatAverageScore = (flatmates) => {
  const simScores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const simScore = this.calculateSimilarityScoreBetweenUsers(mate1, mate2)
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

 */
/* function cosineSimilarityNPM(u, v) {
  return cosineSimilarityNPMfunction(u, v)
}
 */

/* function euclidianDistance(a, b) {
  if (a.length !== b.length) {
    return (new Error('The vectors must have the same length'))
  }
  let d = 0.0
  for (let i = 0, max = a.length; i < max; i += 1) {
    d += (a[i] - b[i]) * (a[i] - b[i])
  }
  return Math.sqrt(d)
} */


/* function calculateCosineSimScore(u, v) {
  const magU = Math.sqrt(u.map(el => el * el).reduce((a, b) => a + b, 0))
  const magV = Math.sqrt(v.map(el => el * el).reduce((a, b) => a + b, 0))

  let dotProduct = 0
  for (let index = 0; index < u.length; index += 1) {
    const ui = u[index]
    const vi = v[index]
    dotProduct += ui * vi
  }
  // const dotProduct = sumVector.reduce((a, b) => a + b, 0)


  const finalScore = dotProduct / (magU * magV)

  return Math.floor(finalScore * 100)
}

function calculateSimScoreFromUsers(uData, vData) {
  const u = []
  const v = []

  for (let q = 0; q < 20; q += 1) {
    u.push(uData[`q${q + 1}`])
    v.push(vData[`q${q + 1}`])
  }
  return calculateCosineSimScore(u, v)
}

function calculateSimScoreFromUsersCustom(u, v) {
  let score = 0
  for (let q = 0; q < 20; q += 1) {
    score += Math.abs(u[q] - v[q])
  }

  return score
}
 */

module.exports.normalize = normalize
module.exports.extractVectorsFromUsers = extractVectorsFromUsers

/* module.exports.calculateSimScoreFromUsers = calculateSimScoreFromUsers
module.exports.calculateCosineSimScore = calculateCosineSimScore
module.exports.euclidianDistance = euclidianDistance
module.exports.calculateSimScoreFromUsersCustom = calculateSimScoreFromUsersCustom
module.exports.cosineSimilarityNPM = cosineSimilarityNPM
 */
