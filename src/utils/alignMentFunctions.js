import euclidianDistanceSquared from 'euclidean-distance/squared'

const cosineDistance = require('compute-cosine-distance')

export function calculateAlignment(flatmates, feature, combine = [], similarityFunction = cosineDistance) {
  const similarities = []

  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      if (i !== j) {
        const mate2 = flatmates[j]
        let similarity = 0
        if (combine.length > 0) {
          similarity = similarityFunction(mate1[combine[0]].concat(mate1[combine[1]]), mate2[combine[0]].concat(mate2[combine[1]]))
        } else {
          similarity = similarityFunction(mate1[feature], mate2[feature])
        }
        similarities.push(similarity >= 0 ? similarity : 0)
      }
    }
  }

  let distance = 0
  if (similarities.length > 1) {
    distance = similarities.reduce((a, b) => a + b) / similarities.length
  }
  return distance
}


export function mapSimScoreToPercentage(simScore) { return Math.floor((1 - (simScore / 320)) * 100) }

export function mapCosineScoreToPercentage(cosineScore) {
  return Math.floor(100 * (1 - cosineScore / 2))
}

export function calculateSimilarityScoreBetweenUsers(uData, vData) {
  console.log(uData.personalityVector)
  console.log(vData.personalityVector)
  const u = uData.personalityVector
  const v = vData.personalityVector


  // const vectorDistance = euclidianDistanceSquared(u, v)
  // const simScore = mapSimScoreToPercentage(vectorDistance)
  // const cosineSim = cosineSimilarity(u, v)
  // console.log(cosineSim)

  // return 1 - cosineSim

  return mapCosineScoreToPercentage(cosineDistance(u, v))
}

export function calculateFlatScore(flatmates) {
  const simScores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const simScore = calculateSimilarityScoreBetweenUsers(mate1, mate2)
        simScores.push(simScore)
      }
    }
  }

  let flatScore = 100
  if (simScores.length > 1) {
    flatScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
  }
  return Math.floor(flatScore)
}

export function createGroupPropertyVector(flatmates) {
  const groupVector = []
  const propertyVectors = flatmates.map(mate => mate.propertyVector)
  for (let i = 0; i < propertyVectors[0].length; i += 1) {
    let sum = 0
    for (let j = 0; j < flatmates.length; j += 1) {
      sum += propertyVectors[j][i]
    }
    groupVector.push(sum / propertyVectors.length)
  }
  return groupVector
}

export function mapPropScoreToPercentage(propScore) { return Math.floor((1 - (propScore / 48)) * 100) }

export function calculatePropertyAlignment(flatmates) {
  const propScores = []
  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      const mate2 = flatmates[j]
      if (i !== j) {
        const propScore = euclidianDistanceSquared(mate1.propertyVector, mate2.propertyVector)
        propScores.push(mapPropScoreToPercentage(propScore))
      }
    }
  }

  let propertyAlignment = 100
  if (propScores.length > 1) {
    propertyAlignment = propScores.reduce((a, b) => a + b, 0) / propScores.length
  }
  return Math.floor(propertyAlignment)
}
