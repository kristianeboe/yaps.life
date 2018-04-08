
/**
 * @jest-environment node
 */


const { createGroupPropertyVector } = require('../clusteringAlgorithms/clusteringPipeline')

test('GroupPropertyVector', () => {
  const flatmates = [{ propertyVector: [3, 3, 3] }, { propertyVector: [1, 3, 5] }, { propertyVector: [3, 5, 3] }, { propertyVector: [3, 3, 3] }]
  const groupPropertyVector = createGroupPropertyVector(flatmates)
  expect(groupPropertyVector).toEqual([10 / 4, 14 / 4, 14 / 4])
})
