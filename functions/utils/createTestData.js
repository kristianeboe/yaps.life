const uuid = require('uuid')
const {
  WORKPLACES,
  UNIVERSITIES,
  GENDERS,
  STUDY_PROGRAMMES,
  BUDGETS,
  PROPERTY_SIZES,
  NEWNESS
} = require('./constants')

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1
}

function createTestUsers(n) {
  const users = []

  for (let index = 0; index < n; index += 1) {
    const answerVector = []
    for (let j = 0; j < 20; j += 1) {
      answerVector.push(getRandomInt(5) - 3)
    }
    const university =
      UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)]
    const studyProgramme =
      STUDY_PROGRAMMES[university][
        Math.floor(Math.random() * Math.floor(STUDY_PROGRAMMES[university].length))
      ]
    const workplaceKey = Math.floor(Math.random() * Math.floor(Object.keys(WORKPLACES).length))
    const workplace = Object.keys(WORKPLACES)[workplaceKey]
    const workplaceLatLng = WORKPLACES[workplace]
    const budget = BUDGETS[Math.floor(Math.random() * BUDGETS.length)]
    const propertySize = PROPERTY_SIZES[Math.floor(Math.random() * PROPERTY_SIZES.length)]
    const newness = NEWNESS[Math.floor(Math.random() * NEWNESS.length)]
    const propertyVector = [budget, propertySize, newness]
    const user = {
      uid: uuid.v4(),
      displayName: `testUser${index}`,
      matchLocation: 'Oslo',
      seeNewUsers: false,
      workplace,
      propertyVector,
      workplaceLatLng,
      photoURL: `https://placem.at/people?w=290&h=290&random=${getRandomInt(100)}`,
      university,

      age: Math.floor(Math.random() * 10) + 20,
      tos: true,
      readyToMatch: true,
      gender: GENDERS[Math.floor(Math.random() * GENDERS.length)],
      studyProgramme,
      answerVector
    }
    users.push(user)
  }
  return users
}

function createTestProperties(n) {
  const properties = []

  for (let index = 0; index < n; index += 1) {
    const budget = BUDGETS[Math.floor(Math.random() * BUDGETS.length)]
    const propertySize = PROPERTY_SIZES[Math.floor(Math.random() * PROPERTY_SIZES.length)]
    const newness = NEWNESS[Math.floor(Math.random() * NEWNESS.length)]
    const propertyVector = [budget, propertySize, newness]
    const property = {
      uid: uuid.v4(),
      location: 'Oslo',
      address: '',
      budget,
      propertySize,
      newness,
      propertyVector
    }
    properties.push(property)
  }
  return properties
}


const me = {
  age: '25',
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'Kristian Elset Bø',
  gender: 'Male',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL:
    'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg',
  answerVector: [1, 0, 0, 0, 1, 2, 1, 0, 1, 1, -2, -2, -1, -1, -1, 2, 2, 2, 2, 1],
  readyToMatch: true,
  studyProgramme: 'Computer Science',
  tos: true,
  uid: 'hWBbCxiigfUISnJ8upb6pnUDfXG3',
  university: 'NTNU',
  workplace: 'Netlight AS Oslo'
}

const antiKristianUser = {
  displayName: 'Anti Kristian Elset Bø',
  gender: 'Male',
  matchLocation: 'Oslo',
  answerVector: [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 2, 2, 2, 2, -2, -2, -2, -2, -2]
}

const kristianVector = [1, 0, 0, 0, 1, 2, 1, 0, 1, 1, -2, -2, -1, -1, -1, 2, 2, 2, 2, 1]
const antiKristianVector = [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 2, 2, 2, 2, -2, -2, -2, -2, -2]

module.exports.createTestUsers = createTestUsers
module.exports.me = me
module.exports.antiKristianUser = antiKristianUser
module.exports.kristianVector = kristianVector
module.exports.antiKristianVector = antiKristianVector
module.exports.createTestProperties = createTestProperties
