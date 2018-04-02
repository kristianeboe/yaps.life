function postProcessingUser(userId, userData, userRef) {
  let updateObject = {}
  return getMachScores(userId, userData)
    .then(matchScores => {
      matchScores.sort((a, b) => a.score - b.score)
      top3 = matchScores.slice(0, 3)
      updateObject.matchScores = matchScores
      updateObject.top3 = top3
      const bestMatchId = Object.keys(matchScores).reduce((a, b) => (matchScores[a] > matchScores[b] ? a : b))
      return top3
    })
    .then(top3 => {
      return googleMapsDistance(userData.workplace, top3)
      // googleMapsDistance(roommates)
    })
    .then(bestOrigin => {
      console.log('bestOrigin', bestOrigin)
      // userRef.collection('roommates').add({
      //   matches: updateObject.matchScores,
      //   bestMatchId: updateObject.bestMatchId,
      //   bestOrigin: bestOrigin,
      // })
      console.log('updateObject', updateObject)
      userRef.update({
        match: {
          roommates: updateObject.top3,
          bestOrigin,
          matches: updateObject.matchScores,
          top3: updateObject.top3,
        },
      })
    })
    .catch(error => {
      console.log(error)
    })
}

function getMachScores(userId, userData) {
  return new Promise((resolve, reject) => {
    console.log('made it inside promise 1')
    let matchScores = []

    admin
      .firestore()
      .collection('users')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(user => {
          if (userId != user.id) {
            matchScores.push({
              userId: user.id,
              score: match(userData, user.data()),
            })
          }
        })
        resolve(matchScores)
      })
      .catch(error => {
        console.log('Trouble getting matchScores', error)
        reject(error)
      })
  })
}

function match(newUser, matchUser) {
  let matchScore = 0
  for (const field1 in newUser.field_of_work) {
    for (const field2 in matchUser.field_of_work) {
      if (field1 === field2) {
        matchScore = matchScore + 1
      }
    }
  }

  for (const field1 in newUser.preferences_apartment) {
    for (const field2 in matchUser.preferences_apartment) {
      if (field1 === field2) {
        matchScore = matchScore + 1
      }
    }
  }
  for (const field1 in newUser.preferences_roommates) {
    for (const field2 in matchUser.preferences_roommates) {
      if (field1 === field2) {
        matchScore = matchScore + 1
      }
    }
  }
  return matchScore
}

function googleMapsDistance(userWorkplace, top3) {
  return new Promise((resolve, reject) => {
    const origin1 = 'Arnebråtveien 75D Oslo'
    const origin2 = 'Nydalen Oslo'
    const origin3 = 'Grunerløkka Oslo'

    let origins = [origin1, origin2, origin3].map(origin => encodeURI(origin))
    let userWorkplaceWithoutSpaces = userWorkplace.replace(/,/g, ' ')
    let destinations = [encodeURI(userWorkplaceWithoutSpaces)]
    console.log('top3', top3)
    console.log('destinations before', destinations)
    Promise.all(
      top3.map(user =>
        admin
          .firestore()
          .collection('users')
          .doc(user.userId)
          .get()
      )
    )
      .then(results => {
        results.map(doc => {
          const userWorkplace = doc.data().workplace
          const userWorkplaceWithoutSpaces = userWorkplace.replace(/,/g, ' ')
          destinations.push(encodeURI(userWorkplaceWithoutSpaces))
        })

        return destinations
      })
      .then(destinations => {
        console.log('destinations after', destinations)
        const mode = 'transit'

        // const nextMondayAt8 = getNextDayOfWeek(new Date(), 1).getTime()

        // '&departure_time=' + nextMondayAt8
        let requestUrl =
          'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' +
          origins.join('|') +
          '&destinations=' +
          destinations.join('|') +
          '&mode=' +
          mode +
          '&key=' +
          'AIzaSyB1wF4E4VWSxKj2dbldiERiK1bc9EABvBo'
        return requestUrl
      })
      .then(requestUrl => {
        axios
          .get(requestUrl)
          .then(response => {
            console.log(response.data)
            const data = response.data

            const origins = data.origin_addresses
            const destinations = data.destination_addresses

            let originsToDestinationsObject = {}
            let bestOrigin = ''
            try {
              for (let i = 0; i < origins.length; i++) {
                var results = data.rows[i].elements
                for (let j = 0; j < results.length; j++) {
                  var element = results[j]
                  var distance = element.distance
                  var duration = element.duration
                  var from = origins[i]
                  var to = destinations[j]
                  console.log(from, to, duration.value)
                  originsToDestinationsObject[from] = { [to]: duration.value }
                }
              }
              bestOrigin = getBestOrigin(originsToDestinationsObject)
            } catch (error) {
              bestOrigin = 'Could not determine'
            }

            console.log(originsToDestinationsObject)

            resolve(bestOrigin)
          })
          .catch(error => {
            console.log('error in axios and data parsing', error)
            reject(error)
          })
      })
      .catch(error => {
        console.log('error bestOrigin', error)
        reject(error)
      })
  })
}
