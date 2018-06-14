const fs = require('fs')
const realUsers = require('./realUsersV2.json')

// .filter(user => user.personalityVector.length === 20 && user.propertyVector.length === 4)
// .filter(user => !['Lindsay', 'Marius Engan Kran', 'Fredrik Moger', 'Emjo Berge', 'Halvor Fladsrud Bø', 'Markus',].includes(user.displayName))
const cleanUsers = realUsers.map((user) => {
  if (user.propertyVector.length > 4) {
    user.propertyVector = user.propertyVector.slice(0, 4)
  }
  if (user.propertyVector.some(el => el > 2)) {
    user.propertyVector = user.propertyVector.map(el => el - 3)
  }
  if (user.personalityVector.some(el => el > 2)) {
    user.personalityVector = user.personalityVector.map(el => el - 3)
  }
  if (user.personalityVector.some(el => el < -2)) {
    user.personalityVector = user.personalityVector.map(el => el + 1)
  }

  return user
})

fs.writeFile('cleanUsersV2.json', JSON.stringify(cleanUsers), 'utf8', () => { })


cleanUsers.forEach((user) => {
  console.log(user.displayName, user.personalityVector, user.propertyVector)
})
console.log(cleanUsers.length)
