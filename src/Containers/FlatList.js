import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import _ from 'underscore'
import PropertySegment from './PropertySegment'


const FlatList = (props) => {
  const { flats } = props
  return _.sortBy(flats, 'commuteScore').map((flat, index) => (
    <PropertySegment key={flat.listing.uid} property={flat.listing} commuteScore={flat.commuteScore} groupScore={flat.groupScore} index={index} />
  ))
}


export default FlatList
