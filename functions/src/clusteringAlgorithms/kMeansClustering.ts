const kMeans = require('node-kmeans')
const densityClustering = require('density-clustering');
const euclidianDistanceSquared = require('euclidean-distance/squared')

function euclidianDistance(a, b) {
  if (a.length !== b.length) {
    return (new Error('The vectors must have the same length'));
  }
  let d = 0.0;
  for (let i = 0, max = a.length; i < max; ++i) {
    d += Math.pow((a[i] - b[i]), 2);
  }
  return d;
}

export function kMeansClustering(vectors) {
  // console.log(users[0])
  return new Promise((resolve, reject) => {
    // console.log(vectors)
    // distance: (a,b) => similarity(a,b)
    // const k = Math.floor(users.length / 4) // users.length > 500 ? 10 : 4
    const k = Math.ceil(Math.log2(vectors.length))
    kMeans.clusterize(vectors, { k, distance: euclidianDistanceSquared }, (err, res) => {
      if (err) reject(err)
      else {
        const clusters = []
        res.forEach((item) => {
          clusters.push(item.clusterInd)
        })
        resolve(clusters)
      }
      // console.log('clusters', clusters)
    })
  })
}

export function dbScanClustering(vectors) {
  const dbScan = new densityClustering.DBSCAN()
  const clusters = dbScan.run(vectors, 9, 3)
  
  return clusters


}