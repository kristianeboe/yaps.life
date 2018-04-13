import React from 'react'
import { List, Header, Segment, Icon, Button, Grid } from 'semantic-ui-react'
import _ from 'underscore'

const FlatList = (props) => {
  const { flats } = props

  return (
    <Segment>
      <Header as="h3" dividing >
          3. See your list of options here, sorted by commute time and group score
        <Header.Subheader>
            Neat, or what? :)
        </Header.Subheader>
      </Header>

      { _.sortBy(flats, 'commuteScore').map((flat, index) => (
        <Segment key={flat.address} clearing>
          <Header as="h4">{index + 1}. {flat.apartmentMetaData ? flat.apartmentMetaData.title : flat.address}
            <Header.Subheader>{flat.address}</Header.Subheader>
          </Header>
          <Button floated="right" icon="external" color="blue" as="a" target="_blank" href={flat.finnListingURL} />

          <Grid columns="equal">
            <Grid.Column>
              {`Commute score: ${flat.commuteScore ? flat.commuteScore : ''}`}
            </Grid.Column>
            <Grid.Column>
              {`Group property alignment: ${flat.groupScore ? flat.groupScore : ''}`}
            </Grid.Column>
          </Grid>
        </Segment>

      ))}

    </Segment>)
}


export default FlatList
