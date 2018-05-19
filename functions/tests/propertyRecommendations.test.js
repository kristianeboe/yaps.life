
/**
 * @jest-environment node
 */

const euclidianDistanceSquared = require('euclidean-distance/squared')
const { createGroupPropertyVector } = require('../lib/clusteringAlgorithms/clusteringPipeline')

test('GroupPropertyVector', () => {
  const flatmates = [{ propertyVector: [3, 3, 3] }, { propertyVector: [1, 3, 5] }, { propertyVector: [3, 5, 3] }, { propertyVector: [3, 3, 3] }]
  const groupPropertyVector = createGroupPropertyVector(flatmates)
  expect(groupPropertyVector).toEqual([10 / 4, 14 / 4, 14 / 4])
})


const getListingScore = (commuteTime, groupPropertyVector, propertyVector) => {
  const weights = [0.3, 0.3, 0.2, 0.1, 0.1]
  const commuteScore = commuteTime < 700 ? 5 : commuteTime < 1500 ? 4 : commuteTime < 2600 ? 2 : 1

  const expandedGroupVector = [4].concat(groupPropertyVector)
  const expandedPropertyVector = [commuteScore].concat(propertyVector)

  const listingScore = euclidianDistanceSquared(expandedGroupVector, expandedPropertyVector)

  const WexpandedGroupVector = expandedGroupVector.map((el, i) => el * weights[i])
  const WexpandedPropertyVector = expandedPropertyVector.map((el, i) => el * weights[i])

  const WlistingScore = euclidianDistanceSquared(WexpandedGroupVector, WexpandedPropertyVector)

  console.log(listingScore, WlistingScore)

  return WlistingScore
}

const printFlatList = (flatList) => {
  flatList.forEach((flat, index) => {
    console.log(index + 1, flat.address, flat.commuteTime, flat.listingScore)
  })
}


test('FlatListRank', () => {
  const groupPropertyVector = [1, 5, 5, 5]
  const flatList = [
    {
      address: 'Majorstua',
      propertyVector: [3, 5, 5, 3],
      commuteTime: 600
    },
    {
      address: 'National',
      propertyVector: [5, 3, 5, 5],
      commuteTime: 600,
    },
    {
      address: 'Grunerløkka',
      propertyVector: [1, 3, 3, 1],
      commuteTime: 900,
    },
  ]
  printFlatList(flatList)

  const updatedFlatlist = flatList.map((flat) => {
    const listingScore = getListingScore(flat.commuteTime, groupPropertyVector, flat.propertyVector)
    return { address: flat.address, listingScore }
  })

  printFlatList(updatedFlatlist)

  expect(updatedFlatlist[0].address).toBe('Grunerløkka')
})
