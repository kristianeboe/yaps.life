const euclidianDistance = require('euclidean-distance')

export function knnClustering(vectors, K) {
  const clusters = []
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

    const topK = scores
      .sort((a, b) => a.score - b.score)
      .slice(0, K)
      .map(el => el.j)
    clusters.push(topK)
  }
  return clusters
}

export function knnClusteringOneMatchPerUser(vectors, K) {
  const clusters = []
  const vectorsWithIndex = vectors.map((v, i) => ({ v, i }))
  while (vectorsWithIndex.length > 0) {
    const scores = []
    const u = vectorsWithIndex.pop()
    vectorsWithIndex.forEach((v, j) => {
      const score = euclidianDistance(u.v, v.v)
      scores.push({ i: v.i, j, score })
    })
    const topK = scores.sort((a, b) => a.score - b.score).slice(0, K - 1)
    topK.forEach(el => vectorsWithIndex.pop(el.j))
    clusters.push([u.i].concat(topK.map(el => el.i)))
  }

  return clusters
}

export function knnClusteringSingleMatchTestUsers(
  userVector,
  testUserVectors,
  K
) {
  const u = userVector
  const scores = []
  for (let j = 0; j < testUserVectors.length; j += 1) {
    const v = testUserVectors[j]
    const score = euclidianDistance(u, v)
    scores.push({ j, score })
  }
  const topK = scores
      .sort((a, b) => a.score - b.score)
      .slice(0, K-1)
      .map(el => el.j)
  
  return topK
}
