const { auth, firestore } = require('./firebase')

const fs = require('fs')


firestore.collection('users').get().then((snapshot) => {
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
