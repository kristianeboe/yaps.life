const kMeans = require('node-kmeans')

function kMeansClustering(vectors) {
  // console.log(users[0])
  return new Promise((resolve, reject) => {
    // console.log(vectors)
    // distance: (a,b) => similarity(a,b)
    // const k = Math.floor(users.length / 4) // users.length > 500 ? 10 : 4
    const k = 5
    kMeans.clusterize(vectors, { k }, (err, res) => {
      if (err) reject(err)
      else {
        const clusters = []
        Object.keys(res).forEach((item) => {
          clusters.push(res[item].clusterInd)
        })
        resolve(clusters)
      }
      // console.log('clusters', clusters)
    })
  })
}


module.exports = kMeansClustering
