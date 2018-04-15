import * as admin from'firebase-admin'

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query
    .get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0
      }

      // Delete documents in a batch
      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
        doc.ref.collection('messages').get().then((snapMatch) => {
          snapMatch.forEach(message => message.ref.delete())
        }).catch(err => console.log(err))
        batch.delete(doc.ref)
      })

      return batch.commit().then(() => snapshot.size)
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve()
        return
      }
      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject)
      })
    })
    .catch(reject)
}

export function deleteMatchClusterCollection() {
  const batchSize = 100
  const db = admin.firestore()
  const collectionRef = admin.firestore().collection('matches')
  const query = collectionRef
    .where('custom', '==', false)
    .orderBy('__name__')
    .limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject)
  })
}
