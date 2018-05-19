
export function normalize(vector) {
  const magnitude = Math.sqrt(vector.map(el => el * el).reduce((a, b) => a + b, 0))
  const normalized = vector.map(ele => ele / magnitude)
  return normalized
}
export function extractVectorsFromUsers(users, normalizeVectors) {
  const userVectors = []
  users.forEach((user) => {
    const enhancedPropVector = user.propertyVector.map((el, index )=> index < 2 ? el * 5 : el *3)
    userVectors.push(normalizeVectors ? normalize(user.answerVector) : user.answerVector.concat(enhancedPropVector))
  })

  return userVectors
}