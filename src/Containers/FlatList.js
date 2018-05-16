import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import _ from 'underscore'
import PropertySegment from './PropertySegment'


const FlatList = (props) => {
  const { flats, landlord, flatmates } = props
  return _.chain(flats).sortBy('commuteTime').reverse().sortBy('groupScore')
    .reverse()
    .value()
    .map((flat, index) => (
      <PropertySegment
        key={flat.listingId}
        property={flat.listingData}
        commuteTime={flat.commuteTime}
        groupScore={flat.groupScore}
        listingId={flat.listingId}
        matchId={props.matchId}
        index={index}
        flatmates={flatmates}
        landlord={landlord}
      />))
}


export default FlatList
