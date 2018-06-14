/* const { createTestUsers } = require('../lib/utils/createTestData')

const fs = require('fs')

const testUsers = createTestUsers(10000)
const testUserArrays = [8, 16, 32, 48, 64, 80, 96, 104, 156, 208, 300, 416, 600, 832, 1000, 1200, 1350, 1600, 1800, 2000].map(userSize => ({ id: String(userSize), data: testUsers.slice(0, userSize) }))

testUserArrays.forEach((el) => {
  fs.writeFile(`testData/testUsers${el.id}.json`, JSON.stringify(el.data), 'utf8', (err) => { console.log(err) })
})

fs.writeFile('testData/testUsers10000.json', JSON.stringify(testUsers), 'utf8', () => {})

 */
const admin = require('firebase-admin')

admin.initializeApp()
const { createTestUsers } = require('../lib/utils/createTestData')

const fs = require('fs')

admin.firestore().collection('users').get().then((snapshot) => {
  const realUsers = []
  snapshot.forEach((userDoc) => {
    const realUser = userDoc.data()
    if (realUser.personalityvector.some(el => el !== 0)) {
      realUsers.push(realUser)
    }
  })
  console.log(realUsers.length)
  const realUserArrays = [8, 16, 32].map(userSize => ({ id: String(userSize), data: realUsers.slice(0, userSize) }))
  realUserArrays.forEach((el) => {
    fs.writeFile(`realData/realUsers${el.id}.json`, JSON.stringify(el.data), 'utf8', (err) => { console.log(err) })
  })
})


// fs.writeFile('realData/realUsers10000.json', JSON.stringify(realUsers), 'utf8', () => {})
