const { createTestUsers } = require('../lib/utils/createTestData')

const fs = require('fs')

const testUsers = createTestUsers(10000)
const testUsers16 = testUsers.slice(0, 16)
const testUsers32 = testUsers.slice(0, 32)
const testUsers48 = testUsers.slice(0, 48)
const testUsers64 = testUsers.slice(0, 64)
const testUsers80 = testUsers.slice(0, 80)
const testUsers96 = testUsers.slice(0, 96)
const testUsers112 = testUsers.slice(0, 112)
const testUsers128 = testUsers.slice(0, 128)

const testUserArrays = [
  { id: '16', data: testUsers16 },
  { id: '32', data: testUsers32 },
  { id: '48', data: testUsers48 },
  { id: '64', data: testUsers64 },
  { id: '80', data: testUsers80 },
  { id: '96', data: testUsers96 },
  { id: '112', data: testUsers112 },
  { id: '128', data: testUsers128 },
]

testUserArrays.forEach((el) => {
  fs.writeFile(`testData/testUsers${el.id}.json`, JSON.stringify(el.data), 'utf8', () => {})
})

fs.writeFile('testData/testUsers10000.json', JSON.stringify(testUsers), 'utf8', () => {})
