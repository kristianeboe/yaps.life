const euclidianDistanceSquared = require('euclidean-distance/squared')
const cosineDistance = require('compute-cosine-distance')

export function knnClustering(vectors, K, similarityFunction=euclidianDistanceSquared) {
  // vectors are the combined personality and property vectors to be clustered. 
  //K is the group size the algorithm is supposed to produce.
  const clusters = []
  // While there are users to cluster, do:
  for (let i = 0; i < vectors.length; i += 1) {
    // Get current user
    const u = vectors[i]
    const scores = []
    // Iterate through remaining users and score them compared to the current user.
    for (let j = 0; j < vectors.length; j += 1) {
      const v = vectors[j]
      if (i !== j) {
        const score = similarityFunction(u, v)
        scores.push({ j, score })
      }
    }
    // Sort the socred users from best to worst.
    scores.sort((a, b) => a.score - b.score)
    // Extract the top K.
    const topK = scores.slice(0, K-1)
    // Concat the original user with the topK and push them into the returned cluster vector.
    clusters.push([i].concat(topK.map(el => el.j)))
  }
  return clusters
}

export function knnClusteringOneMatchPerUser(vectors, similarityFunction=euclidianDistanceSquared) {
  // vectors are the combined personality and property vectors to be clustered. 
  //K is the group size the algorithm is supposed to produce.
  const clusters = []
  // Map vectors into an object that remembers initial index of vector. 
  // This is used to map the clustered vectors back into users.
  const vectorsWithIndex = vectors.map((v, i) => ({ v, i }))
  let K = 4
  if (vectors.length %2 === 0) {
    K = 4
  } else if (vectors.length %3 === 0) {
K = 3
  }
  else if (vectors.length % 5 === 0 || vectors.length === 13) {
    K = 5
  }
  // While there are users to cluster, do:
  while (vectorsWithIndex.length > 0) {
    const scores = []
    // Remove the first user from the user pool.
    const u = vectorsWithIndex.pop()
    // Iterate through remaining users and score them compared to the current user.
    vectorsWithIndex.forEach((v, j) => {
      const score = similarityFunction(u.v, v.v)
      scores.push({ i: v.i, j, score })
    })
    // Sort the socred users from best to worst.
    scores.sort((a, b) => a.score - b.score)
    // Extract the top K.
    
    const topK = scores.slice(0, K-1).sort((a, b) => b.j - a.j)
    // Remove the top k from the user pool.
    topK.forEach(el => {
      vectorsWithIndex.splice(el.j, 1)
    })
    // Concat the original user with the topK and push them into the returned cluster vector.
    const flatmates = [u.i].concat(topK.map(el => el.i))
    clusters.push(flatmates)
  }

  return clusters
}

export function knnClusteringSingleMatchTestUsers(userVector, testUserVectors, K, similarityFunction=cosineDistance) {
  const u = userVector
  const scores = []
  for (let j = 0; j < testUserVectors.length; j += 1) {
    const v = testUserVectors[j]
    const score = similarityFunction(u, v)
    scores.push({ j, score })
  }
  scores.sort((a, b) => a.score - b.score)
  const topK = scores.slice(0, K-1).map(el => el.j)
  
  return topK
}
