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

const euclidianDistanceSquared = require('euclidean-distance/squared')
const cosineDistance = require('compute-cosine-distance')

const { extractVectorsFromUsers, enhancePropertyVector, enhancePersonalityVector } = require('../lib/utils/vectorFunctions')
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

function getMedian(matches, feature, sorted = false) {
  // const matches = matches.slice(0) // create copy
  const middle = Math.floor((matches.length) / 2)
  if (!sorted) {
    matches.sort((a, b) => a[feature] - b[feature])
  }
  return matches[middle] // (matches.length % 2 === 0) ? matches[middle - 1] : (matches[middle - 1.5] + matches[middle - 0.5]) / 2
}

function getScoreCard(algorithmName, matches, userSize) {
  const averagePersonalityAlignment = getAverageFeatureAcrossMatches(matches, 'personalityAlignment')
  const averagePropertyAlignment = getAverageFeatureAcrossMatches(matches, 'propertyAlignment')
  const averageCombinedAlignment = getAverageFeatureAcrossMatches(matches, 'combinedAlignment')

  matches.sort((a, b) => a.alignments.cosineDistance.combinedAlignment - b.alignments.cosineDistance.combinedAlignment)
  const medianMatch = getMedian(matches, 'combinedAlignment', true)
  const minMatch = matches[0]
  const maxMatch = matches.slice(-1)[0]

  const minCombinedScore = minMatch.combinedAlignment
  const maxCombinedScore = maxMatch.combinedAlignment

  const frequencies = {
    '0-10': 0,
    '11-50': 0,
    '51-70': 0,
    '71-90': 0,
    '91-110': 0,
    '111-130': 0,
    '130+': 0

  }

  matches.forEach((match) => {
    const combinedAlignment = match.combinedAlignment
    if (combinedAlignment <= 10) {
      frequencies['0-10'] += 1
    } else if (combinedAlignment <= 50) {
      frequencies['11-50'] += 1
    } else if (combinedAlignment <= 70) {
      frequencies['51-70'] += 1
    } else if (combinedAlignment <= 90) {
      frequencies['71-90'] += 1
    } else if (combinedAlignment <= 110) {
      frequencies['91-110'] += 1
    } else if (combinedAlignment <= 130) {
      frequencies['111-130'] += 1
    } else {
      frequencies['130+'] += 1
    }
  })
  // console.log(frequencies)

  return {
    id: `${userSize}-${algorithmName}`,
    userSize,
    numberOfMatches: matches.length,
    matches,
    algorithm: algorithmName,
    data: {
      medianMatch,
      minMatch,
      maxMatch,
      averagePersonalityAlignment,
      averagePropertyAlignment,
      averageCombinedAlignment,
    }
  }
}

function printScoreCard(scoreCard) {
  return (
    `${scoreCard.id}`
    + `\n Nr of matches: ${scoreCard.numberOfMatches}`
    /* + `\n Worst personality alignment: ${scoreCard.data.maxMatch.personalityAlignment}`
    + `\n Average personality alignment: ${scoreCard.data.averagePersonalityAlignment}`
    + `\n Best personality alignment: ${scoreCard.data.minMatch.personalityAlignment}`
    + `\n Worst property alignment: ${scoreCard.data.maxMatch.propertyAlignment}`
    + `\n Average property alignment: ${scoreCard.data.averagePropertyAlignment}`
    + `\n Best property alignment: ${scoreCard.data.minMatch.propertyAlignment}` */
    + '\n'
    + 'euclidian squared'
    + `\n Worst property alignment: ${scoreCard.data.maxMatch.propertyAlignment}`
    + `\n Median property alignment: ${scoreCard.data.medianMatch.propertyAlignment}`
    + `\n Best property alignment: ${scoreCard.data.minMatch.propertyAlignment}`
    + `\n Worst personality alignment: ${scoreCard.data.maxMatch.personalityAlignment}`
    + `\n Median personality alignment: ${scoreCard.data.medianMatch.personalityAlignment}`
    + `\n Best personality alignment: ${scoreCard.data.minMatch.personalityAlignment}`
    + `\n Worst combined alignment: ${scoreCard.data.maxMatch.combinedAlignment}`
    + `\n Median combined alignment: ${scoreCard.data.medianMatch.combinedAlignment}`
    + `\n Best combined alignment: ${scoreCard.data.minMatch.combinedAlignment}`
    + '\n'
    + 'euclidian'
    + `\n Worst property alignment: ${scoreCard.data.maxMatch.alignments.euclideanDistance.propertyAlignment}`
    + `\n Median property alignment: ${scoreCard.data.medianMatch.alignments.euclideanDistance.propertyAlignment}`
    + `\n Best property alignment: ${scoreCard.data.minMatch.alignments.euclideanDistance.propertyAlignment}`
    + `\n Worst personality alignment: ${scoreCard.data.maxMatch.alignments.euclideanDistance.personalityAlignment}`
    + `\n Median personality alignment: ${scoreCard.data.medianMatch.alignments.euclideanDistance.personalityAlignment}`
    + `\n Best personality alignment: ${scoreCard.data.minMatch.alignments.euclideanDistance.personalityAlignment}`
    + `\n Worst combined alignment: ${scoreCard.data.maxMatch.alignments.euclideanDistance.combinedAlignment}`
    + `\n Median combined alignment: ${scoreCard.data.medianMatch.alignments.euclideanDistance.combinedAlignment}`
    + `\n Best combined alignment: ${scoreCard.data.minMatch.alignments.euclideanDistance.combinedAlignment}`
    + '\n'
    + 'cosine'
    + `\n Worst property alignment: ${scoreCard.data.maxMatch.alignments.cosineDistance.propertyAlignment}`
    + `\n Median property alignment: ${scoreCard.data.medianMatch.alignments.cosineDistance.propertyAlignment}`
    + `\n Best property alignment: ${scoreCard.data.minMatch.alignments.cosineDistance.propertyAlignment}`
    + `\n Worst personality alignment: ${scoreCard.data.maxMatch.alignments.cosineDistance.personalityAlignment}`
    + `\n Median personality alignment: ${scoreCard.data.medianMatch.alignments.cosineDistance.personalityAlignment}`
    + `\n Best personality alignment: ${scoreCard.data.minMatch.alignments.cosineDistance.personalityAlignment}`
    + `\n Worst combined alignment: ${scoreCard.data.maxMatch.alignments.cosineDistance.combinedAlignment}`
    + `\n Median combined alignment: ${scoreCard.data.medianMatch.alignments.cosineDistance.combinedAlignment}`
    + `\n Best combined alignment: ${scoreCard.data.minMatch.alignments.cosineDistance.combinedAlignment}`
    + '\n'

  )
}


const testUsersAll = require('./testData/testUsers10000')// .map(user => ({ ...user, personalityVector: user.personalityVector.map(e => e + 3), propertyVector: user.propertyVector.map(e => e + 3) }))

const realUsers = require('./realData/cleanUsersV2.json')// .map(user => ({ ...user, personalityVector: user.personalityVector.map(e => e + 3), propertyVector: user.propertyVector.map(e => e + 3) }))


const bruteforce = async (testUsers, similarityFunction = null) => {
  const testUsersEnhanced = testUsers.map(mate => ({
    ...mate,
    // personalityVector: enhancePersonalityVector(mate.personalityVector),
    // propertyVector: enhancePropertyVector(mate.propertyVector)
  }))
  const matchArray = []
  for (let i = 0; i < testUsers.length; i += 1) {
    const testUser1 = testUsersEnhanced[i]
    for (let j = 0; j < testUsers.length; j += 1) {
      if (j === i) break
      const testUser2 = testUsersEnhanced[j]
      for (let k = 0; k < testUsers.length; k += 1) {
        if (k === j) break
        const testUser3 = testUsersEnhanced[k]
        for (let l = 0; l < testUsers.length; l += 1) {
          if (l === k) break
          const testUser4 = testUsersEnhanced[l]
          const flatmates = [testUser1, testUser2, testUser3, testUser4]
          const match = await createMatchFromFlatmates(flatmates, false, true)
          matchArray.push(match)
        }
      }
    }
  }
  return matchArray
}

async function baseline(testUsers, similarityFunction = null) {
  const testUsersEnhanced = testUsers.map(mate => ({
    ...mate,
    // propertyVector: enhancePropertyVector(mate.propertyVector),
    // personalityVector: enhancePersonalityVector(mate.personalityVector),
  }))

  const perChunk = 4
  const clusters = testUsersEnhanced.reduce((all, one, i) => {
    const ch = Math.floor(i / perChunk)
    all[ch] = [].concat((all[ch] || []), one)
    return all
  }, [])

  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function kNNoneMatchPerUser(testUsers) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClusteringOneMatchPerUser(vectors, euclidianDistanceSquared)// , cosineDistance, true)
  // organize into flats

  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function kNNoneMatchPerUserCosine(testUsers) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClusteringOneMatchPerUser(vectors, cosineDistance)
  // organize into flats

  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))

  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}


async function kNNallToAll(testUsers) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  // Cluster with kNN
  let clusters = knnClustering(vectors, 4, cosineDistance, true)
  // organize into flats
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))


  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function kMeans(testUsers, similarityFunction, max = false) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const kClusters = await kMeansClustering(vectors)

  let clusters = createFlatmatesFromClusters(kClusters)
  // console.log(clusters)
  clusters = clusters.map(flatmates =>
    flatmates.map(id => testUsers[id]))


  return Promise.all(clusters.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
}

async function hybrid(testUsers, similarityFunction) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const kClusters = await kMeansClustering(vectors)

  const testUsersClustered = kClusters.map(c =>
    c.map(id => testUsers[id]))

  const matchList = await Promise.all(testUsersClustered.map(async (kClusteredTestUsers) => {
    const vectorsV2 = extractVectorsFromUsers(kClusteredTestUsers, false)
    const kNNClusters = knnClusteringOneMatchPerUser(vectorsV2, euclidianDistanceSquared)
    const clustersV2 = kNNClusters.map(flatmates =>
      flatmates.map(id => kClusteredTestUsers[id]))

    return Promise.all(clustersV2.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  }))

  return [].concat.apply([], matchList)
}

async function hybridCosine(testUsers, similarityFunction) {
  const vectors = extractVectorsFromUsers(testUsers, false)
  const kClusters = await kMeansClustering(vectors)
  // console.log(kClusters)

  const testUsersClustered = kClusters.map(c =>
    c.map(id => testUsers[id]))

  const matchList = await Promise.all(testUsersClustered.map(async (kClusteredTestUsers) => {
    const vectorsV2 = extractVectorsFromUsers(kClusteredTestUsers, false)
    const kNNClusters = knnClusteringOneMatchPerUser(vectorsV2, cosineDistance)
    const clustersV2 = kNNClusters.map(flatmates =>
      flatmates.map(id => kClusteredTestUsers[id]))

    return Promise.all(clustersV2.map(async cluster => createMatchFromFlatmates(cluster, false, true)))
  }))

  return [].concat.apply([], matchList)
}

const algorithms = [
  { name: 'bruteforce', matchingFunction: bruteforce },
  { name: 'zhybrid', matchingFunction: hybrid },
  { name: 'zhybridCosine', matchingFunction: hybridCosine },
  { name: 'baseline', matchingFunction: baseline },
  { name: 'kNNoneMatchPerUser', matchingFunction: kNNoneMatchPerUser },
  { name: 'kNNoneMatchPerUserCosine', matchingFunction: kNNoneMatchPerUserCosine },
  { name: 'kMeans', matchingFunction: kMeans },
  // { name: 'kNNallToAll', matchingFunction: kNNallToAll },
]

const bruteforceSizes = [8, 16, 24, 32, 48, 64]
const regularUserSizes = [30, 80, 96, 104, 156, 208, 300, 416, 600, 832, 1000]// , 1200, 1350, 1600, 1800, 2000]

async function getData(userSizes, bruteforce = false) {
  // const userSizes = bruteforce ? bruteforceSizes : regularUserSizes
  const algorithmsToEvaluate = bruteforce ? algorithms.slice(0, 1) : algorithms.slice(1)
  return Promise.all(userSizes.map(async (userSize) => {
    /* const users = realUsers.slice(0, userSize).map(user => ({
      ...user,
      personalityVector: user.personalityVector.map(el => el + 3),
      propertyVector: user.propertyVector.map(el => el + 3)
    })) */
    const users = shuffle(testUsersAll.slice(0, userSize))
    const algorithmResults = await Promise.all(algorithmsToEvaluate.map(async (algorithm) => {
      const matches = await algorithm.matchingFunction(users)
      const scoreCard = getScoreCard(algorithm.name, matches, userSize)
      // console.log(printScoreCard(scoreCard))
      return scoreCard
    }))
    // console.log(algorithmResults)
    // console.log('yo', algorithmResults.map(result => [result.data.minMatch.combinedAlignment, result.data.maxMatch.combinedAlignment, result.data.median.combinedAlignment, result.data.averageCombinedAlignment][0]))

    // allMatches
    // return algorithmResults
    // Bruteforce
    return [userSize].concat([
    //  algorithmResults[0].data.medianMatch.alignments.euclideanDistance.combinedAlignment, algorithmResults[0].data.minMatch.alignments.euclideanDistance.combinedAlignment, algorithmResults[0].data.maxMatch.alignments.euclideanDistance.combinedAlignment,
    // algorithmResults[0].data.medianMatch.alignments.euclidianDistanceSquared.combinedAlignment, algorithmResults[0].data.minMatch.alignments.euclidianDistanceSquared.combinedAlignment, algorithmResults[0].data.maxMatch.alignments.euclidianDistanceSquared.combinedAlignment,
      algorithmResults[0].data.medianMatch.alignments.cosineDistance.combinedAlignment, algorithmResults[0].data.minMatch.alignments.cosineDistance.combinedAlignment, algorithmResults[0].data.maxMatch.alignments.cosineDistance.combinedAlignment,
    ])
    // [userSize].concat(algorithmResults.map(result => [result.data.minMatch.combinedAlignment, result.data.maxMatch.combinedAlignment, result.data.median.combinedAlignment, result.data.averageCombinedAlignment])[0])
    // [algorithmResults.minMatch.combinedAlignment, algorithmResults.maxMatch.combinedAlignment, algorithmResults.median.combinedAlignment, algorithmResults.averageCombinedAlignment])//
  }))
}

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

const drawCharts = async (userSizes) => {
  // create data

  const data = await getData(userSizes, false)


  await Promise.all(data[0].map(async (algorithm) => {
    // console.log('hello', algorithm)
    // .filter(match => match.flatmates.length > 1)
    const algorithmData = algorithm.matches.map((match, index) => [index, match.alignments.cosineDistance.combinedAlignment])
    console.log()
    console.log(algorithm.algorithm)
    // console.log(algorithmData)
    algorithmData.forEach((dataArray) => {
      console.log(`${dataArray[1]}`)
    })
    const frequencies = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    }
    algorithm.matches.forEach((match) => {
      frequencies[match.flatmates.length] += 1
    })
    // console.log(match.flatmates.map(mate => mate.displayName))

    /* console.log(algorithm.algorithm)
    console.log(frequencies)
    console.log(algorithm.matches.map(match => (
      match.flatmates.map(mate => mate.displayName).concat(match.combinedAlignment)
    ))) */
    const anychartData = anychart.data.set(algorithmData)
    /*   const baseline = anychartData.mapAs({ x: 0, value: 1 })
    const kNNoneMatchPerUser = anychartData.mapAs({ x: 0, value: 2 })
    const kNNallToAll = anychartData.mapAs({ x: 0, value: 3 })
    const kMeans = anychartData.mapAs({ x: 0, value: 4 }) */

    /* const minMatch = anychartData.mapAs({ x: 0, value: 1 })
    const maxMatch = anychartData.mapAs({ x: 0, value: 2 })
    const medianMatch = anychartData.mapAs({ x: 0, value: 3 })
    const average = anychartData.mapAs({ x: 0, value: 4 }) */

    const seriesData = anychartData.mapAs({ x: 0, value: 1 })


    // create a chart
    const chart = anychart.line()

    // create line series and set the data
    const series = chart.line(seriesData)
    series.name(algorithm.algorithm)
    series.normal().stroke('blue')
    /* const baselineSeries = chart.line(minMatch)
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
    kMeansSeries.normal().stroke('brown') */


    // set the chart title
    const chartTitle = `1match distribution, test users, ${algorithm.id}, cosine combined alginment`
    chart.title(chartTitle)
    chart.legend(true)


    // set the titles of the axes
    const xAxis = chart.xAxis()
    xAxis.title('matches')
    const yAxis = chart.yAxis()

    // set scale for the chart, this scale will be used in all scale dependent entries such axes, grids, etc
    yAxis.title('Combined alignment')


    // set the container id
    chart.container('container')
    chart.bounds(0, 0, 1200, 1000)

    chart.yScale().minimum(0)
    chart.yScale().maximum(2)

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
  }))
}

const drawChartsInOne = async (feature) => {
  // create data
  const data = await getData()

  const algorithmData = algorithm.matches.map((match, index) => [index, match.combinedAlignment])

  const anychartData = anychart.data.set(algorithmData)

  /*   const baseline = anychartData.mapAs({ x: 0, value: 1 })
    const kNNoneMatchPerUser = anychartData.mapAs({ x: 0, value: 2 })
    const kNNallToAll = anychartData.mapAs({ x: 0, value: 3 })
    const kMeans = anychartData.mapAs({ x: 0, value: 4 }) */

  /* const minMatch = anychartData.mapAs({ x: 0, value: 1 })
    const maxMatch = anychartData.mapAs({ x: 0, value: 2 })
    const medianMatch = anychartData.mapAs({ x: 0, value: 3 })
    const average = anychartData.mapAs({ x: 0, value: 4 }) */

  const seriesData = anychartData.mapAs({ x: 0, value: 1 })


  // create a chart
  const chart = anychart.line()

  // create line series and set the data
  const series = chart.line(seriesData)
  series.name(algorithm.algorithm)
  series.normal().stroke('blue')
  /* const baselineSeries = chart.line(minMatch)
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
    kMeansSeries.normal().stroke('brown') */


  // set the chart title
  const chartTitle = `Algorithm: ${algorithm.id}, combined alginment`
  chart.title(chartTitle)
  chart.legend(true)


  // set the titles of the axes
  const xAxis = chart.xAxis()
  xAxis.title('matches')
  const yAxis = chart.yAxis()

  const logScale = anychart.scales.log()
  logScale.minimum(1)
    .maximum(45000)

    // set scale for the chart, this scale will be used in all scale dependent entries such axes, grids, etc
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

// drawChart('runningtime')

const drawBruteforce = async () => {
  const data = await getData(bruteforceSizes, true)
  console.log(data)

  const anychartData = anychart.data.set(data)

  const cosineMedian = anychartData.mapAs({ x: 0, value: 1 })
  const cosineBest = anychartData.mapAs({ x: 0, value: 2 })
  const cosineWorst = anychartData.mapAs({ x: 0, value: 3 })


  /* const euclidianSquaredMedian = anychartData.mapAs({ x: 0, value: 4 })
  const euclidianSquaredBest = anychartData.mapAs({ x: 0, value: 5 })
  const euclidianSquaredWorst = anychartData.mapAs({ x: 0, value: 6 })

  const euclidianMedian = anychartData.mapAs({ x: 0, value: 7 })
  const euclidianBest = anychartData.mapAs({ x: 0, value: 8 })
  const euclidianWorst = anychartData.mapAs({ x: 0, value: 9 }) */

  // create a chart
  const chart = anychart.line()
  // set the chart title
  const chartTitle = 'best, median and worst, hybrid cosine, real users, cosine'
  chart.title(chartTitle)
  chart.legend(true)

  // create line series and set the data
  const cosineMedianSeries = chart.line(cosineMedian)
  cosineMedianSeries.name('cosine Median')
  cosineMedianSeries.normal().stroke('blue')
  const cosineBestSeries = chart.line(cosineBest)
  cosineBestSeries.name('cosine Best')
  cosineBestSeries.normal().stroke('green')
  const cosineWorstSeries = chart.line(cosineWorst)
  cosineWorstSeries.name('cosine Worst')
  cosineWorstSeries.normal().stroke('red')

  /* const euclideanSquaredMedianSeries = chart.line(euclideanSquaredMedian)
  euclideanSquaredMedianSeries.name('Euclidian Squared Median')
  euclideanSquaredMedianSeries.normal().stroke('blue')
  const euclideanSquaredBestSeries = chart.line(euclideanSquaredBest)
  euclideanSquaredBestSeries.name('Euclidian Squared Best')
  euclideanSquaredBestSeries.normal().stroke('blue')
  const euclideanSquaredWorstSeries = chart.line(euclideanSquaredWorst)
  euclideanSquaredWorstSeries.name('Euclidian Squared Worst')
  euclideanSquaredWorstSeries.normal().stroke('blue')

  const cosineMedianSeries = chart.line(cosineMedian)
  cosineMedianSeries.name('Cosine Median')
  cosineMedianSeries.normal().stroke('green')
  const cosineBestSeries = chart.line(cosineBest)
  cosineBestSeries.name('Cosine Best')
  cosineBestSeries.normal().stroke('green')
  const cosineWorstSeries = chart.line(cosineWorst)
  cosineWorstSeries.name('Cosine Worst')
  cosineWorstSeries.normal().stroke('green') */


  // set the titles of the axes
  const xAxis = chart.xAxis()
  xAxis.title('Users')
  const yAxis = chart.yAxis()
  yAxis.title('Combined alignment')

  chart.yScale().minimum(0)
  chart.yScale().maximum(2)

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

async function getResults() {
  const testUsers = testUsersAll.slice(0, 32)
  const bruteforceMatches = await bruteforce(testUsers)
  const bruteforceScoreCard = getScoreCard('Bruteforce', bruteforceMatches, 32)
  console.log(printScoreCard(bruteforceScoreCard))
  getData(false)
}

/* realUsers.forEach((user) => {
  console.log(user.displayName, user.personalityVector, user.propertyVector)
})
console.log(realUsers.length) */
drawBruteforce()
/* getData([40]).then((data) => {
  // console.log(data)
  data[0].matches.forEach((match) => {
    console.log(match.flatmates.map(mate => mate.displayName))
  })
}) */

/* [10000].forEach((userSizes) => {
  drawCharts([userSizes])
}) */

/* bruteforceSizes.forEach((userSizes) => {
  drawCharts([userSizes])
} */

// drawChartsInOne()
/* console.log(realUsers.length)
realUsers.slice(0, 32).forEach((user) => {
  console.log(user.displayName, user.personalityVector) // [...user.personalityVector, ...user.propertyVector].length)
}) */
// console.log(realUsers.find(el => el.displayName === 'Mathias Iden'))
/* testUsersAll.slice(0, 32).forEach((user) => {
  console.log([...user.personalityVector, ...user.propertyVector].length)
})
 */
