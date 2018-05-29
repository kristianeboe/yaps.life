import React from 'react'
import { List, Card, Label, Header, Segment, Button, Grid, Rating, Image } from 'semantic-ui-react'
import moment from 'moment'
import { BUDGET_TO_TEXT, STANDARD_TO_TEXT, STYLE_TO_TEXT, PROPERTY_SIZE_TO_TEXT } from '../utils/CONSTANTS'
import { secondsToMinutes } from '../utils/FormattingFunctions'
import ChatAccordion from '../Components/ChatAccordion'
import wireframeImage from '../assets/images/imageWireframe.png'
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


const PropertyCard = ({
  property, index, commuteTime, groupScore, listingScore, landlord, matchDoc, listingId, cheapest, fastest
}) => {
  const {
    title, address, pricePerRoom, propertyVector, listingURL, showChat, rentFrom, rentTo, numberOfBedrooms, propertySize
  } = property
  const { flatmates } = matchDoc.data()
  const [budget, propertySize1, standard, style] = propertyVector
  const dateString = `Rent from ${moment(rentFrom).format('MMMM Do')}`
  return (
    <Card
      href={listingURL}
      target="_blank"
      centered
      fluid
    >
      {/* <Image
        fluid
        label={(cheapest && <Label color="red" ribbon="right">Cheapest</Label>) || (fastest && <Label color="blue" ribbon="right">Fastest</Label>)}
        src={wireframeImage}
      /> */}
      <Card.Content>
        <Header as="h4">
          {(index + 1) ? `${index + 1}.` : ''} {title || address}
        </Header>
      </Card.Content>
      <Card.Content>
        <Card.Description>
          <Grid columns="equal">
            <Grid.Column>
              <List size="small" >
                <List.Item icon="home" content={address} />
                <List.Item icon="money" content={`${pricePerRoom} kr per person`} />
                {commuteTime && flatmates && (<List.Item icon="bus" content={`Commute time: ${secondsToMinutes(commuteTime)} minutes`} />)}
              </List>
            </Grid.Column>
            <Grid.Column>
              <List size="small" >
                <List.Item icon="bed" content={`${numberOfBedrooms} bedroom${numberOfBedrooms > 1 ? 's' : ''}`} />
                {rentFrom && <List.Item icon="calendar" content={dateString.concat(rentTo ? ` to ${moment(rentTo).format('MMMM Do')}` : '')} />}
                <List.Item icon="cube" content={PROPERTY_SIZE_TO_TEXT[Math.floor(propertySize1)]} />

                {/* <Button floated="right" icon="external" color="blue" as="a" target="_blank" href={listingURL} /> */}
              </List>
            </Grid.Column>
          </Grid>
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Rating size="huge" defaultRating={(Math.floor((1 - listingScore) * 10) / 2) + (index === 0 ? 1 : 0)} maxRating={5} disabled />
        { cheapest &&
          <Label
            color="red"
            ribbon="right"
            style={{
              position: 'absolute',
              bottom: '14px',
              marginLeft: '-14px'
            }}
          >
          Cheapest
          </Label>
        }
        { fastest &&
        <Label
          color="blue"
          ribbon="right"
          style={{
              position: 'absolute',
              bottom: '14px',
              marginLeft: '-14px'
            }}
        >
        Fastest
        </Label>
      }
      </Card.Content>

      {/* <Label.Group circular>
        <Label as="a">{BUDGET_TO_TEXT[budget]}</Label>
        <Label as="a">{PROPERTY_SIZE_TO_TEXT[propertySize]}</Label>
        {/* <Label as="a">{STYLE_TO_TEXT[style]}</Label>
        <Label as="a">{STANDARD_TO_TEXT[standard]}</Label>
      </Label.Group> */}


      {showChat &&
        <ChatAccordion landlord={landlord} listingId={listingId || null} matchId={landlord ? null : matchDoc.id} />
      }
    </Card>
  )
}

export default PropertyCard


/* { cheapest && <Label color="red" ribbon="right">Cheapest</Label>}
        { fastest && <Label color="blue" ribbon="right">Fastest</Label>}
        <List.Item icon="cube" content={<div>{propertySize} <sup>2</sup></div>} />
 */
