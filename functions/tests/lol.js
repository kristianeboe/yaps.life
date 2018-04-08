
const uuid = require('uuid')
const { knnClusteringOneMatchPerUser } = require('../clusteringAlgorithms/knnClustering')
const createTestData = require('../utils/createTestData')
const { createFlatmatesFromClusters, calculateFlatScore } = require('../clusteringAlgorithms/clusteringPipeline')
const { extractVectorsFromUsers } = require('../utils/vectorFunctions')

const testUsers = createTestData.createTestUsers(16)
// extract question vectors
const vectors = extractVectorsFromUsers(testUsers, false)
// Cluster with kNN
const clusters = knnClusteringOneMatchPerUser(vectors, 4)
console.log(clusters)
// organize into flats
let allFlatmates = createFlatmatesFromClusters(clusters)
allFlatmates = allFlatmates.map(flatmates =>
  flatmates.map(id => testUsers[id]))
/*
// Turn flats into matches
const matchArray = []
allFlatmates.forEach((flatmates) => {
  const flatScore = calculateFlatScore(flatmates)

  const matchUid = uuid.v4()
  const match = {
    uid: matchUid,
    flatmates,
    location: 'Oslo', // remember to change this in the future
    bestOrigin: '',
    flatScore,
    custom: false
  }
  matchArray.push(match)
})
let averageMatchScore = 0
matchArray.forEach((match) => {
  averageMatchScore += match.flatScore
})
averageMatchScore /= matchArray.length
console.log(averageMatchScore)
 */
