import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import _ from 'underscore'
import PropertySegment from './PropertySegment'


const FlatList = (props) => {
  const { flats, landlord, flatmates } = props
  return _.sortBy(flats, 'commuteScore').map((flat, index) => {
    console.log(flat)
    console.log(index, flat.uid, flat.listingURL)
    return <PropertySegment landlord={landlord} matchId={props.matchId} key={flat.uid || flat.listingURL} property={flat.listing} commuteScore={flat.commuteScore} groupScore={flat.groupScore} index={index} />
  })
}


export default FlatList
