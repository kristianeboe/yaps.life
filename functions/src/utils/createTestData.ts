import * as uuid from 'uuid'
import {
  WORKPLACES,
  UNIVERSITIES,
  GENDERS,
  STUDY_PROGRAMMES,
  BUDGETS,
  PROPERTY_SIZES,
  NEWNESS
} from './constants'

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1
}

export function createTestUsers(n) {
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

export function createTestProperties(n) {
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


export const me = {
  age: '25',
  currentMatchId: 'f9345ee3-58c2-4f91-a3c7-331554b7c88f',
  displayName: 'Kristian Elset Bø',
  gender: 'Male',
  matchLocation: 'Oslo',
  seeNewUsers: false,
  photoURL:
    'https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg',
  answerVector: [1, 0, 0, 0, 1, 2, 1, 0, 1, 1, -2, -2, -1, -1, -1, 2, 2, 2, 2, 1],
  propertyVector: [5, 5, 5],
  readyToMatch: true,
  studyProgramme: 'Computer Science',
  tos: true,
  uid: 'hWBbCxiigfUISnJ8upb6pnUDfXG3',
  university: 'NTNU',
  workplace: 'Netlight AS Oslo',
  workplaceLatLng: {
    lat: 59.9131672,
    lng: 10.741938699999992
  }
}

export const antiKristianUser = {
  displayName: 'Anti Kristian Elset Bø',
  uid: 'hWBbCxiigfUISnJ8upb',
  gender: 'Male',
  matchLocation: 'Oslo',
  answerVector: [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 2, 2, 2, 2, -2, -2, -2, -2, -2],
  propertyVector: [5, 5, 5],
  workplace: 'Capra Consulting Oslo',
  workplaceLatLng: {
    lat: 59.9130579,
    lng: 10.751287199999979
  }
}

export const kristianVector = [1, 0, 0, 0, 1, 2, 1, 0, 1, 1, -2, -2, -1, -1, -1, 2, 2, 2, 2, 1]
export const antiKristianVector = [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, 2, 2, 2, 2, 2, -2, -2, -2, -2, -2]

export const exampleMatch = {
  uid: '35c974dc-882d-486b-a47d-c9bb09a47707',
  flatmates: [me, antiKristianUser, me, antiKristianUser],
  finnQueryString: 'https://www.finn.no/realestate/lettings/search.html?location=0.20061&location=1.20061.20508&no_of_bedrooms_from=4&property_type=1&property_type=3&property_type=4&property_type=2',
  groupPropertyVector: [3,3,3]
}