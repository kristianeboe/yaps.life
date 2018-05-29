import euclidianDistanceSquared from 'euclidean-distance/squared'

export function calculateAlignment(flatmates, feature, combine = []) {
  const similarityDistances = []

  for (let i = 0; i < flatmates.length; i += 1) {
    const mate1 = flatmates[i]
    for (let j = 0; j < flatmates.length; j += 1) {
      if (i !== j) {
        const mate2 = flatmates[j]
        if (combine.length > 0) {
          const similarityDistance = euclidianDistanceSquared(mate1[combine[0]].concat(mate1[combine[1]]), mate2[combine[0]].concat(mate2[combine[1]]))
          similarityDistances.push(similarityDistance)
        } else {
          const similarityDistance = euclidianDistanceSquared(mate1[feature], mate2[feature]) // calculateSimilarityScoreBetweenUsers(mate1, mate2)
          similarityDistances.push(similarityDistance)
        }
      }
    }
  }

  let distance = 0
  if (similarityDistances.length > 1) {
    distance = similarityDistances.reduce((a, b) => a + b, 0) / similarityDistances.length
  }
  return Math.floor(distance)
}


export function mapSimScoreToPercentage(simScore) { return Math.floor((1 - (simScore / 320)) * 100) }

export function calculateSimilarityScoreBetweenUsers(uData, vData) {
  console.log(uData.personalityVector)
  console.log(vData.personalityVector)
  const u = uData.personalityVector
  const v = vData.personalityVector

  const vectorDistance = euclidianDistanceSquared(u, v)
  const simScore = mapSimScoreToPercentage(vectorDistance)

  return simScore
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
