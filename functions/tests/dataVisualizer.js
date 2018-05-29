const admin = require('firebase-admin')

admin.initializeApp()

// require file system and jsdom
const fs = require('fs')

// For jsdom version 10 or higher.
// Require JSDOM Class.
const JSDOM = require('jsdom').JSDOM
// Create instance of JSDOM.
const jsdom = new JSDOM('<body><div id="container"></div></body>', { runScripts: 'dangerously' })
// Get window
const window = jsdom.window
// require anychart and anychart export modules
const anychart = require('anychart')(window)
const anychartExport = require('anychart-nodejs')(anychart)


const { extractVectorsFromUsers } = require('../lib/utils/vectorFunctions')
const {
  knnClustering, knnClusteringOneMatchPerUser, knnClusteringSingleMatchTestUsers
} = require('../lib/clusteringAlgorithms/knnClustering')
const { kMeansClustering } = require('../lib/clusteringAlgorithms/kMeansClustering')
const {
  createMatchFromFlatmates, createGroupPropertyVector, calculateAlignment, createFlatmatesFromClusters
} = require('../lib/clusteringAlgorithms/clusteringPipeline')

function getAverageFeatureAcrossMatches(matchArray, field) {
  let averageFeature = 0
  matchArray.forEach((match) => {
    averageFeature += match[field]
  })
  averageFeature /= matchArray.length
  return averageFeature
}

function printScoreCard(algorithmName, matches) {
  const averageMatchScore = getAverageFeatureAcrossMatches(matches, 'personalityAlignment')
  const averagePropertyAlignment = getAverageFeatureAcrossMatches(matches, 'propertyAlignment')
  const averageCombinedAlignment = getAverageFeatureAcrossMatches(matches, 'combinedAlignment')
  const maxMatch = matches.reduce((a, c) => (a.combinedAlignment > c.combinedAlignment ? a : c))
  const minMatch = matches.reduce((a, c) => (a.combinedAlignment < c.combinedAlignment ? a : c))
  return (
    // `${algorithmName}`
  // + `\n Nr of matches; ${matches.length}`
  // + `\n Worst personality alignment; ${maxMatch.personalityAlignment}`
    `\n Average personality alignment; ${averageMatchScore}`
  // + `\n Best personality alignment; ${minMatch.personalityAlignment}`
  // + `\n Worst property alignment; ${maxMatch.propertyAlignment}`
  + `\n Average property alignment; ${averagePropertyAlignment}`
  // + `\n Best property alignment; ${minMatch.propertyAlignment}`
  + `\n Worst combined alignment; ${maxMatch.combinedAlignment}`
  + `\n Average combined alignment; ${averageCombinedAlignment}`
  + `\n Best combined alignment; ${minMatch.combinedAlignment}`)
}


const testUsersAll = require('./testData/testUsers10000')

const bruteforce = async (testUsers) => {
  const matchArray = []
  for (let i = 0; i < testUsers.length; i += 1) {
    const testUser1 = testUsers[i]
    for (let j = 0; j < testUsers.length; j += 1) {
      if (j === i) break
      const testUser2 = testUsers[j]
      for (let k = 0; k < testUsers.length; k += 1) {
        if (k === j) break
        const testUser3 = testUsers[k]
        for (let l = 0; l < testUsers.length; l += 1) {
          if (l === k) break
          const testUser4 = testUsers[l]
          const flatmates = [testUser1, testUser2, testUser3, testUser4]
          const match = await createMatchFromFlatmates(flatmates, false, true)
          matchArray.push(match)
        }
      }
    }
  }
  return matchArray
}

async function baseline(testUsers) {
  const perChunk = 4
  const clusters = testUsers.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk)
    all[ch] = [].concat((all[ch] || []), one)
    return all
  }, [])

  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function kNNoneMatchPerUser(testUsers) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClusteringOneMatchPerUser(vectors, 4)
  // organize into flats

  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function kNNallToAll(testUsers) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClustering(vectors, 4)
  // organize into flats
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function kMeans(testUsers) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const kClusters = await kMeansClustering(vectors, false)
  // expect(clusters.length).toBe(5)

  let clusters = createFlatmatesFromClusters(kClusters)
  // console.log(clusters)
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))


  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

const algorithms = [
  // { name: 'bruteforce', matchingFunction: bruteforce },
  { name: 'baseline', matchingFunction: baseline },
  { name: 'kNNoneMatchPerUser', matchingFunction: kNNoneMatchPerUser },
  { name: 'kNNallToAll', matchingFunction: kNNallToAll },
  { name: 'kMeans', matchingFunction: kMeans },
]

const userSizes = [52, 104, 208, 416, 832, 1200, 1600, 2000]
const bruteforceSegments = [8, 16, 32, 48, 64, 80, 96]

let start = process.hrtime()

const elapsed_time = function (note) {
  const precision = 3 // 3 decimal places
  const elapsed = process.hrtime(start)[1] / 1000000 // divide by a million to get nano to milli
  console.log(`${process.hrtime(start)[0]} s, ${elapsed.toFixed(precision)} ms - ${note}`) // print message + time
  start = process.hrtime() // reset the timer
}

async function getData(feature) {
  return Promise.all(userSizes.map(async (userSize) => {
    const testUsers = testUsersAll.slice(0, userSize)
    for (const algorithm of algorithms) {
      // elapsed_time(`start ${algorithm.name}, ${userSize}`)
      console.time(`${algorithm.name}, ${userSize}`)
      const matches = await algorithm.matchingFunction(testUsers)
      console.timeEnd(`${algorithm.name}, ${userSize}`)
      // elapsed_time(`end ${algorithm.name}, ${userSize}`)
    }
    const algorithmResults = await Promise.all(algorithms.slice(0, 1).map(async (algorithm) => {
      // console.log(userSize, algorithm.name)
      // elapsed_time(`start ${algorithm.name}`)
      const matches = await algorithm.matchingFunction(testUsers)
      // elapsed_time(`end ${algorithm.name}`)
      // console.log(algorithm.name, userSize, matches.length)
      // matches.sort((a, b) => a.combinedAlignment - b.combinedAlignment)
      // const middle = (matches.length + 1) / 2
      /* const median = matches[Math.floor(matches.length / 2)] // (matches.length % 2) ? matches[middle - 1] : (matches[middle - 1.5] + matches[middle - 0.5]) / 2
      const minMatch = matches[0]
      const maxMatch = matches.slice(-1)[0]
      const averagePersonalityAlignment = getAverageFeatureAcrossMatches(matches, 'personalityAlignment')
      const averagePropertyAlignment = getAverageFeatureAcrossMatches(matches, 'propertyAlignment')
      const averageCombinedAlignment = getAverageFeatureAcrossMatches(matches, 'combinedAlignment') */
      // console.log(minMatch.combinedAlignment)
      // return null
      /* return {
        id: userSize,
        data: {
          median,
          minMatch,
          maxMatch,
          averagePersonalityAlignment,
          averagePropertyAlignment,
          averageCombinedAlignment,
        }
      } */
    }))
    // console.log(algorithmResults)
    // console.log('yo', algorithmResults.map(result => [result.data.minMatch.combinedAlignment, result.data.maxMatch.combinedAlignment, result.data.median.combinedAlignment, result.data.averageCombinedAlignment][0]))
    return null // [userSize].concat(algorithmResults.map(result => [result.data.minMatch.combinedAlignment, result.data.maxMatch.combinedAlignment, result.data.median.combinedAlignment, result.data.averageCombinedAlignment])[0])
    // [algorithmResults.minMatch.combinedAlignment, algorithmResults.maxMatch.combinedAlignment, algorithmResults.median.combinedAlignment, algorithmResults.averageCombinedAlignment])//
  }))
}

const drawChart = async (feature) => {
  // create data
  const data = await getData(feature)
  console.log(data)

  const anychartData = anychart.data.set(data)

  /*   const baseline = anychartData.mapAs({ x: 0, value: 1 })
  const kNNoneMatchPerUser = anychartData.mapAs({ x: 0, value: 2 })
  const kNNallToAll = anychartData.mapAs({ x: 0, value: 3 })
  const kMeans = anychartData.mapAs({ x: 0, value: 4 }) */

  const minMatch = anychartData.mapAs({ x: 0, value: 1 })
  const maxMatch = anychartData.mapAs({ x: 0, value: 2 })
  const medianMatch = anychartData.mapAs({ x: 0, value: 3 })
  const average = anychartData.mapAs({ x: 0, value: 4 })


  // create a chart
  const chart = anychart.line()

  // create line series and set the data
  const baselineSeries = chart.line(minMatch)
  baselineSeries.name('Baseline')
  baselineSeries.normal().stroke('red', 1, '10 5', 'round')

  const kNNoneMatchPerUserSeries = chart.line(maxMatch)
  kNNoneMatchPerUserSeries.name('kNNoneMatchPerUser')
  kNNoneMatchPerUserSeries.normal().stroke('blue')

  const kNNallToAllSeries = chart.line(medianMatch)
  kNNallToAllSeries.name('kNNallToAll')
  kNNallToAllSeries.normal().stroke('green')

  const kMeansSeries = chart.line(average)
  kMeansSeries.name('kMeans')
  kMeansSeries.normal().stroke('brown')


  // set the chart title
  const chartTitle = `Algorithm: Bruteforce, ${feature}`
  chart.title(chartTitle)
  chart.legend(true)


  // set the titles of the axes
  const xAxis = chart.xAxis()
  xAxis.title('Users')
  const yAxis = chart.yAxis()
  yAxis.title('Combined alignment')


  // set the container id
  chart.container('container')
  chart.bounds(0, 0, 1200, 1000)

  // initiate drawing the chart
  chart.draw()

  // generate JPG image and save it to a file
  const fileType = 'png'
  return anychartExport.exportTo(chart, fileType).then((image) => {
    fs.writeFile(`${chartTitle}.${fileType}`, image, (fsWriteError) => {
      if (fsWriteError) {
        console.log(fsWriteError)
      } else {
        console.log(`${chartTitle}.${fileType} written, Complete`)
      }
    })
  }, (generationError) => {
    console.log(generationError)
  })
}

drawChart('runningtime')

