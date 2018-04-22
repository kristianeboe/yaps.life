import React from 'react'
import { Card, Label, Header, Segment, Button, Grid } from 'semantic-ui-react'
import { BUDGET_TO_TEXT, STANDARD_TO_TEXT, STYLE_TO_TEXT, PROPERTY_SIZE_TO_TEXT } from '../utils/constants'
import { secondsToMinutes } from '../utils/FormattingFunctions'

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
const PropertySegment = (props) => {
  const { property, index } = props
  console.log(props)
  const {
    title, address, pricePrRoom, propertyVector, listingURL, commuteScore, groupScore
  } = property
  const [budget, propertySize, standard, style] = propertyVector
  return (

    <Segment key={address} clearing>
      <Header as="h4">{index ? `${index + 1}.` : ''} {title || address}
        <Header.Subheader>{address}</Header.Subheader>
        <Header.Subheader>{pricePrRoom} kr per person</Header.Subheader>
      </Header>
      <Button floated="right" icon="external" color="blue" as="a" target="_blank" href={listingURL} />

      <Label.Group circular>
        <Label as="a">{BUDGET_TO_TEXT[budget]}</Label>
        <Label as="a">{PROPERTY_SIZE_TO_TEXT[propertySize]}</Label>
        <Label as="a">{STANDARD_TO_TEXT[standard]}</Label>
        <Label as="a">{STYLE_TO_TEXT[style]}</Label>
      </Label.Group>

      <Grid columns="equal">
        <Grid.Column>
          {`Average commute time: ${commuteScore ? secondsToMinutes(commuteScore / 4) : ''} minutes`}
        </Grid.Column>
        <Grid.Column>
          {`Group property alignment: ${groupScore || ''}`}
        </Grid.Column>
      </Grid>
    </Segment>
  )
}

export default PropertySegment

{ /* <Segment key={flat.address}  clearing>
          <Header as="h4">{index + 1}. {flat.title ? flat.title : flat.address}
            <Header.Subheader>{flat.address}</Header.Subheader>
            <Header.Subheader>{flat.price / 4} kr per person</Header.Subheader>
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
        </Segment> */ }
/*

        <Card>
      <Card.Content>
        <Header as="h4"> {title || address}
          <Header.Subheader>{address}</Header.Subheader>
          <Header.Subheader>{pricePrRoom} kr per person</Header.Subheader>
        </Header>
      </Card.Content>
      <Card.Content extra>
        <Label.Group circular>
          <Label as="a">{BUDGET_TO_TEXT[budget]}</Label>
          <Label as="a">{PROPERTY_SIZE_TO_TEXT[propertySize]}</Label>
          <Label as="a">{standard_TO_TEXT[standard]}</Label>
          <Label as="a">{STYLE_TO_TEXT[style]}</Label>
        </Label.Group>
      </Card.Content>
    </Card> */
