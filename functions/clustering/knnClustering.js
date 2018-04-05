// const _ = require('underscore')
// const { calculateCosineSimScore } = require('./utils/vectorFunctions')
const euclidianDistance = require('euclidean-distance')

function knnClustering(vectors, K) {
  const clusters = []
  const testArrayForPrinting = []
  for (let i = 0; i < vectors.length; i += 1) {
    const u = vectors[i]
    const scores = []
    for (let j = 0; j < vectors.length; j += 1) {
      const v = vectors[j]
      if (i !== j) {
        const score = euclidianDistance(u, v)
        scores.push({ j, score })
      }
    }
    // const topK = _.sortBy(scores, (a, b) => b.score - a.score)
    // flip a and b to go from high to low
    let topK = []

    topK = scores.sort((a, b) => a.score - b.score).slice(0, K).map(el => el.j)
    testArrayForPrinting.push(scores.sort((a, b) => a.score - b.score).slice(0, K))

    clusters.push(topK)
  }
  return clusters
}

module.exports = knnClustering
