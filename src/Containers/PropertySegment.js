import React from 'react'
import { List, Label, Header, Segment, Button, Grid } from 'semantic-ui-react'
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
  property, index, commuteTime, groupScore, matchId, landlord, flatmates, listingId,
}) => {
  const {
    title, address, pricePerRoom, propertyVector, listingURL, showChat, rentFrom, rentTo
  } = property
  const [budget, propertySize, standard, style] = propertyVector
  const dateString = `Rent from ${moment(rentFrom).format('MMMM Do')}`
  return (
    <Segment clearing>
      <Header as="h4">{index + 1 ? `${index + 1}.` : ''} {title || address}
        <Header.Subheader>
          <List size="small" >
            <List.Item icon="home" content={address} />
            <List.Item icon="money" content={`${pricePerRoom} kr per person`} />
            {rentFrom && <List.Item icon="calendar" content={dateString.concat(rentTo ? ` to ${moment(rentTo).format('MMMM Do')}` : '')} />}
          </List>
        </Header.Subheader>
      </Header>
      <Button floated="right" icon="external" color="blue" as="a" target="_blank" href={listingURL} />

      <Label.Group circular>
        <Label as="a">{BUDGET_TO_TEXT[budget]}</Label>
        <Label as="a">{PROPERTY_SIZE_TO_TEXT[propertySize]}</Label>
        <Label as="a">{STYLE_TO_TEXT[style]}</Label>
        <Label as="a">{STANDARD_TO_TEXT[standard]}</Label>
      </Label.Group>

      {commuteTime && flatmates && (
        <Grid columns="equal">
          <Grid.Column>
            {`Average commute time: ${commuteTime ? secondsToMinutes(commuteTime / flatmates.length) : ''} minutes`}
          </Grid.Column>
          <Grid.Column>
            {`Group property alignment: ${groupScore || ''}`}
          </Grid.Column>
        </Grid>
      )}
      {showChat &&
        <ChatAccordion landlord={landlord} listingId={listingId || null} matchId={landlord ? null : matchId} />
      }
    </Segment>
  )
}

export default PropertySegment
