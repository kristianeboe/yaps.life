import React from 'react'
import { List, Header, Segment, Icon, Button, Grid, Label } from 'semantic-ui-react'
import _ from 'underscore'

const secondsToMinutes = (seconds) => {
  const secs = Math.round(seconds)

  if (secs < 0) throw new Error('Seconds must be positive')

  if (secs < 60) {
    if (secs < 10) return `0:0${secs}`

    return `0:${secs}`
  }

  const minuteDivisor = secs % (60 * 60)
  const minutes = Math.floor(minuteDivisor / 60)

  const secondDivisor = minuteDivisor % 60
  let remSecs = Math.ceil(secondDivisor)

  if (remSecs < 10 && remSecs > 0) remSecs = `0${remSecs}`
  if (remSecs === 0) remSecs = `${remSecs}0`

  const time = {
    m: minutes,
    s: remSecs
  }

  return `${time.m}:${time.s}`
}

const FlatList = (props) => {
  const { flats } = props

  return (
    <Segment>
      <Header as="h3" dividing >
          4. See your list of options here, sorted by average commute time and group score
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
              {`Average commute time: ${flat.commuteScore ? secondsToMinutes(flat.commuteScore / 4) : ''} minutes`}
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
