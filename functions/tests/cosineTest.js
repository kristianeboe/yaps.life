const cosineSimilarity = require('compute-cosine-distance')
const euclidianDistance = require('euclidean-distance')
const euclidianDistanceSquared = require('euclidean-distance/squared')


const habitE = [2, 2, 2, 2, 2, 2]
const cleanE = [0, 0, 0, 0, 0]
const socialOE = [-2, -2, -2, -2]
const socialFE = [2, 2, 2, 2, 2]

const extrovert = habitE.concat(cleanE).concat(socialOE).concat(socialFE)
console.log(extrovert)

const habitI = [-2, -2, -2, -2, -2, -2]
const cleanI = [0, 0, 0, 0, 0]
const socialOI = [2, 2, 2, 2]
const socialFI = [-2, -2, -2, -2, -2]

const introvert = habitI.concat(cleanI).concat(socialOI).concat(socialFI)
console.log(introvert)


const randomRealUser = [2, 2, 0, 1, 1, 1, -1, -1, 0, 1, -2, -2, -1, -2, -1, 2, 2, 2, 2, 2]


const kristianVector = [1, 0, 0, 0, 1, 2, 1, 0, 1, 1, -2, -2, -1, -1, -1, 2, 2, 2, 2, 1]

const balance = [1, 0, -1, -1, -1, -1].concat([1, 2, 1, 2, 0]).concat([0, -2, -1, -1]).concat([2, 2, 1, 2, 0])


console.log('extro, intro')
console.log(cosineSimilarity(extrovert, introvert))
console.log(euclidianDistance(extrovert, introvert))
console.log(euclidianDistanceSquared(extrovert, introvert))

console.log()
console.log('kristian, intro')
console.log(cosineSimilarity(kristianVector, introvert))
console.log(euclidianDistance(kristianVector, introvert))
console.log(euclidianDistanceSquared(kristianVector, introvert))

console.log()
console.log('extro, kristian')
console.log(cosineSimilarity(extrovert, kristianVector))
console.log(euclidianDistance(extrovert, kristianVector))
console.log(euclidianDistanceSquared(extrovert, kristianVector))

console.log()
console.log('balance, kristian')
console.log(cosineSimilarity(balance, kristianVector))
console.log(euclidianDistance(balance, kristianVector))
console.log(euclidianDistanceSquared(balance, kristianVector))

console.log()
console.log('balance, extro')
console.log(cosineSimilarity(balance, extrovert))
console.log(euclidianDistance(balance, extrovert))
console.log(euclidianDistanceSquared(balance, extrovert))


console.log()
console.log('balance, intro')
console.log(cosineSimilarity(balance, introvert))
console.log(euclidianDistance(balance, introvert))
console.log(euclidianDistanceSquared(balance, introvert))


console.log()
console.log('kristian, kristian')
console.log(cosineSimilarity(kristianVector, kristianVector))
console.log(euclidianDistance(kristianVector, kristianVector))
console.log(euclidianDistanceSquared(kristianVector, kristianVector))
