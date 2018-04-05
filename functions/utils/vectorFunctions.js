
function normalize(vector) {
  const magnitude = Math.sqrt(vector.map(el => el * el).reduce((a, b) => a + b, 0))
  const normalized = vector.map(ele => ele / magnitude)
  return normalized
}
function extractVectorsFromUsers(users, normalizeVectors) {
  const userVectors = []

  users.forEach((user) => {
    userVectors.push(normalizeVectors ? normalize(user.answerVector) : user.answerVector)
  })

  return userVectors
}


module.exports.normalize = normalize
module.exports.extractVectorsFromUsers = extractVectorsFromUsers

