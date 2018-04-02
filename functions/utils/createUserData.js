const uuid = require('uuid')
const {
  WORKPLACES,
  UNIVERSITIES,
  GENDERS,
  STUDY_PROGRAMMES
} = require('./constants')

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1
}

function createTestUsers(n) {
  const users = []

  for (let index = 0; index < n; index += 1) {
    const vector = []
    for (let j = 0; j < 20; j += 1) {
      vector.push(getRandomInt(5))
    }
    const university =
      UNIVERSITIES[Math.floor(Math.random() * Math.floor(UNIVERSITIES.length))]
    const studyProgramme =
      STUDY_PROGRAMMES[university][
        Math.floor(Math.random() * Math.floor(STUDY_PROGRAMMES[university].length))
      ]
    const user = {
      uid: uuid.v4(),
      displayName: `testUser${index}`,
      matchLocation: 'Oslo',
      seeNewUsers: false,
      workplace:
        WORKPLACES[Math.floor(Math.random() * Math.floor(WORKPLACES.length))],
      photoURL: `https://placem.at/people?w=290&h=290&random=${getRandomInt(100)}`,
      university,
      age: Math.floor(Math.random() * 10) + 20,
      tos: true,
      readyToMatch: true,
      gender: GENDERS[Math.floor(Math.random() * Math.floor(GENDERS.length))],
      studyProgramme
    }
    for (let q = 0; q < 20; q += 1) {
      user[`q${q + 1}`] = vector[q]
    }
    users.push(user)
  }
  return users
}

const user1 = {
  age: 28,
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'testUser24',
  gender: 'Jente',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://placem.at/people?w=290&h=290&random=100',
  q1: 4,
  q2: 5,
  q3: 5,
  q4: 4,
  q5: 3,
  q6: 4,
  q7: 3,
  q8: 5,
  q9: 5,
  q10: 2,
  q11: 5,
  q12: 1,
  q13: 2,
  q14: 4,
  q15: 4,
  q16: 4,
  q17: 5,
  q18: 3,
  q19: 5,
  q20: 3,
  readyToMatch: true,
  studyProgramme: 'Test course',
  tos: true,
  uid: '894904c3-c966-48f1-8834-a8bceb789820',
  university: 'NHH',
  workplace: 'McKinsey Oslo'
}

const user2 = {
  age: 20,
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'testUser17',
  gender: 'Jente',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://placem.at/people?w=290&h=290&random=100',
  q1: 4,
  q2: 3,
  q3: 5,
  q4: 5,
  q5: 1,
  q6: 4,
  q7: 4,
  q8: 1,
  q9: 4,
  q10: 2,
  q11: 4,
  q12: 1,
  q13: 2,
  q14: 2,
  q15: 4,
  q16: 2,
  q17: 1,
  q18: 5,
  q19: 5,
  q20: 4,
  readyToMatch: true,
  studyProgramme: 'Test course',
  tos: true,
  uid: '93715ce7-5182-49d6-89a9-fda54133a450',
  university: 'NHH',
  workplace: 'BCG Oslo'
}

const user3 = {
  age: 27,
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'testUser126',
  gender: 'Gutt',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL: 'https://placem.at/people?w=290&h=290&random=54',
  q1: 1,
  q2: 4,
  q3: 2,
  q4: 3,
  q5: 2,
  q6: 4,
  q7: 4,
  q8: 2,
  q9: 4,
  q10: 5,
  q11: 2,
  q12: 3,
  q13: 2,
  q14: 2,
  q15: 2,
  q16: 3,
  q17: 4,
  q18: 2,
  q19: 2,
  q20: 5,
  readyToMatch: true,
  studyProgramme: 'Test course',
  tos: true,
  uid: 'be1ca834-458f-4b76-abda-9f28d665d05e',
  university: 'NHH',
  workplace: 'Bekk Oslo'
}

const me = {
  age: '25',
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'Kristian Elset Bø',
  gender: 'Gutt',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL:
    'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg',
  q1: 4,
  q2: 4,
  q3: 2,
  q4: 3,
  q5: 4,
  q6: 5,
  q7: 1,
  q8: 2,
  q9: 2,
  q10: 4,
  q11: 1,
  q12: 1,
  q13: 1,
  q14: 2,
  q15: 2,
  q16: 4,
  q17: 5,
  q18: 5,
  q19: 5,
  q20: 3,
  readyToMatch: true,
  studyProgramme: 'Computer Science',
  tos: true,
  uid: 'hWBbCxiigfUISnJ8upb6pnUDfXG3',
  university: 'NTNU',
  workplace: 'Netlight AS Oslo'
}

const antiKristianUser = {
  displayName: 'Anti Kristian Elset Bø',
  gender: 'Gutt',
  matchLocation: 'Oslo',
  q1: 1,
  q2: 1,
  q3: 1,
  q4: 1,
  q5: 1,
  q6: 1,
  q7: 1,
  q8: 1,
  q9: 1,
  q10: 1,
  q11: 5,
  q12: 5,
  q13: 5,
  q14: 5,
  q15: 5,
  q16: 1,
  q17: 1,
  q18: 1,
  q19: 1,
  q20: 1,
}

const kristianVector = [4, 3, 3, 3, 4, 5, 4, 3, 4, 4, 1, 1, 2, 2, 2, 5, 5, 5, 5, 4]
const antiKristianVector = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1]

module.exports.createTestUsers = createTestUsers
module.exports.user1 = user1
module.exports.user2 = user2
module.exports.user3 = user3
module.exports.me = me
module.exports.antiKristianUser = antiKristianUser
module.exports.kristianVector = kristianVector
module.exports.antiKristianVector = antiKristianVector
