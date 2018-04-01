// const _ = require('underscore')
const { calculateCosineSimScore } = require('./utils/vectorFunctions')

function knnClustering(vectors, K) {
  const clusters = []
  const testArrayForPrinting = []
  for (let i = 0; i < vectors.length; i += 1) {
    const u = vectors[i]
    const scores = []
    for (let j = 0; j < vectors.length; j += 1) {
      const v = vectors[j]
      if (i !== j) {
        const score = calculateCosineSimScore(u, v)
        scores.push({ j, score })
      }
    }
    // const topK = _.sortBy(scores, (a, b) => b.score - a.score)
    testArrayForPrinting.push(scores.sort((a, b) => b.score - a.score).slice(0, K))
    const topK = scores.sort((a, b) => b.score - a.score).slice(0, K).map(el => el.j)
    clusters.push(topK)
  }
  console.log(testArrayForPrinting)
  return clusters
}

module.exports = knnClustering
