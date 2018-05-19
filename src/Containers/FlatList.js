import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import _ from 'underscore'
import PropertySegment from './PropertySegment'


const FlatList = (props) => {
  const { flats, landlord, matchDoc } = props
  return _.sortBy(flats, 'listingScore')
    .map((flat, index) => (
      <PropertySegment
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
      />))
}


export default FlatList
