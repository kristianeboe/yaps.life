import React from 'react'
import { List, Header, Segment, Icon, Button, Grid, Label } from 'semantic-ui-react'
import _ from 'underscore'
import PropertySegment from './PropertySegment'


const FlatList = (props) => {
  const { flats } = props

  return (
    <Segment>
      <Header as="h3" dividing >
          4. See your list of options here, sorted by average commute time and group score
        <Header.Subheader>
            The ones already here are the two first listings from Finn.no, feel free to add more.
        </Header.Subheader>
      </Header>

      { _.sortBy(flats, 'commuteScore').map((flat, index) => (
        <PropertySegment key={flat.address} property={flat} index={index} />

      ))}

    </Segment>)
}


export default FlatList
