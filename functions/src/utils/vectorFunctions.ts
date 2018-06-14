
export function normalize(vector) {
  const magnitude = Math.sqrt(vector.map(el => el * el).reduce((a, b) => a + b, 0))
  const normalized = vector.map(ele => ele / magnitude)
  return normalized
}

export function enhancePropertyVector(propertyVector) {
  return propertyVector.map((el, index )=> index < 2 ? el * 5 : el *2)
}

export function enhancePersonalityVector(personalityVector) {
  const socialHabits = personalityVector.slice(0,6).reduce((a,b) => a + b)
  const cleanliness = personalityVector.slice(6, 11).reduce((a,b) => a + b)
  const socialOpenness = personalityVector.slice(11, 15).reduce((a,b) => a + b)
  const socialFlexibility = personalityVector.slice(15, 20).reduce((a,b) => a + b)
  return [socialHabits, cleanliness, socialOpenness, socialFlexibility]

}

export function extractVectorsFromUsers(users, normalizeVectors=false, enhance=true) {
  const userVectors = []
  users.forEach((user) => {
    const enhancedPersonalityVector = enhance ? enhancePersonalityVector(user.personalityVector) : user.personalityVector
    const enhancedPropVector = enhance ? enhancePropertyVector(user.propertyVector) : user.propertyVector
    const rentFrom = user.rentFrom
    if (normalizeVectors) {
      console.log(normalize(enhancedPersonalityVector.concat(enhancedPropVector)))
      userVectors.push(normalize(enhancedPersonalityVector.concat(enhancedPropVector))) // .concat([rentFrom])  
    }
    userVectors.push(enhancedPersonalityVector.concat(enhancedPropVector)) // .concat([rentFrom])
  })

  return userVectors
}