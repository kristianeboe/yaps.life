import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import _ from 'underscore'
import PropertySegment from './PropertySegment'
import PropertyCard from './PropertyCard'


const FlatList = (props) => {
  const { flats, landlord, matchDoc } = props
  console.log(_.chain(flats)
    .sortBy(flat => flat.listingData.pricePerRoom)
    .sortBy('listingScore')
    .value())
  let cheapestId = -1
  let fastestId = -1
  if (flats.length > 0) {
    let fastest = flats[0].commuteTime
    let cheapest = flats[0].listingData.pricePerRoom
    flats.forEach((flat) => {
      console.log(flat.commuteTime, fastest, fastestId)
      if (flat.commuteTime < fastest) {
        fastest = flat.commuteTime
        fastestId = flat.listingId
      }
      if (flat.listingData.pricePerRoom < cheapest) {
        cheapest = flat.listingData.pricePerRoom
        cheapestId = flat.listingId
      }
    })
    if (fastestId === -1) {
      fastestId = flats[0].listingId
    }
  }

  return _.sortBy(flats, 'listingScore')
    .map((flat, index) => (
      <PropertyCard
        key={flat.listingId}
        property={flat.listingData}
        commuteTime={flat.commuteTime}
        groupScore={flat.groupScore}
        listingScore={flat.listingScore}
        listingId={flat.listingId}
        matchId={props.matchId}
        index={index}
        matchDoc={matchDoc}
        landlord={landlord}
        fastest={flat.listingId === fastestId}
        cheapest={flat.listingId === cheapestId}
      />))
}


export default FlatList
