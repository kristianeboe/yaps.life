import React from 'react'
import { List, Label, Header, Segment, Button, Grid, Rating } from 'semantic-ui-react'
import moment from 'moment'
import { BUDGET_TO_TEXT, STANDARD_TO_TEXT, STYLE_TO_TEXT, PROPERTY_SIZE_TO_TEXT } from '../utils/CONSTANTS'
import { secondsToMinutes } from '../utils/FormattingFunctions'
import ChatAccordion from '../Components/ChatAccordion'
/* const fakeProp = {
  title: 'Penthouse på møllenberg',
  address: 'Wessels gate 22b',
  pricePrRoom: 5375,
  budget: 3,
  propertySize: 3,
  standard: 3,
  style: 3,
}
 */

const PropertySegment = ({
  property, index, commuteTime, groupScore, listingScore, landlord, matchDoc, listingId, cheapest, fastest
}) => {
  const {
    title, address, pricePerRoom, propertyVector, listingURL, showChat, rentFrom, rentTo, numberOfBedrooms, propertySize
  } = property
  const { flatmates } = matchDoc.data()
  const [budget, propertySize1, standard, style] = propertyVector
  const dateString = `Rent from ${moment(rentFrom).format('MMMM Do')}`
  return (
    <Segment clearing raised>
      <Header as="h4">
        {index + 1 ? `${index + 1}.` : ''} {title || address}
      </Header>
      { cheapest && <Label color="red" ribbon="right">Cheapest</Label>}
      { fastest && <Label color="blue" ribbon="right">Fastest</Label>}
      <Grid columns="equal">

        {/* <Label.Group circular>
        <Label as="a">{BUDGET_TO_TEXT[budget]}</Label>
        <Label as="a">{PROPERTY_SIZE_TO_TEXT[propertySize]}</Label>
        {/* <Label as="a">{STYLE_TO_TEXT[style]}</Label>
        <Label as="a">{STANDARD_TO_TEXT[standard]}</Label>
      </Label.Group> */}

        <Grid.Column>
          <List size="small" >
            <List.Item icon="home" content={address} />
            <List.Item icon="money" content={`${pricePerRoom} kr per person`} />
            {commuteTime && flatmates && (
              <List.Item icon="bus" content={`Commute time: ${secondsToMinutes(commuteTime)} minutes`} />
            )}
            <Rating size="large" defaultRating={(Math.floor((1 - listingScore) * 10) / 2)} maxRating={5} disabled />
          </List>
        </Grid.Column>
        <Grid.Column>
          <List size="small" >
            <List.Item icon="bed" content={`${numberOfBedrooms} bedrooms`} />
            {rentFrom && <List.Item icon="calendar" content={dateString.concat(rentTo ? ` to ${moment(rentTo).format('MMMM Do')}` : '')} />}
            <List.Item icon="star" content={`${propertySize} <sup>2</sup>`} />

            <Button floated="right" icon="external" color="blue" as="a" target="_blank" href={listingURL} />
          </List>

        </Grid.Column>

      </Grid>
      {showChat &&
        <ChatAccordion landlord={landlord} listingId={listingId || null} matchId={landlord ? null : matchDoc.id} />
      }
    </Segment>
  )
}

export default PropertySegment
