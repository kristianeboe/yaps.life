import React from 'react'
import { Card, Label, Header } from 'semantic-ui-react'
import { BUDGET_TO_TEXT, NEWNESS_TO_TEXT, STYLE_TO_TEXT, PROPERTY_SIZE_TO_TEXT } from '../utils/constants'

const fakeProp = {
  title: 'Penthouse på møllenberg',
  address: 'Wessels gate 22b',
  pricePrRoom: 5375,
  budget: 3,
  propertySize: 3,
  newness: 3,
  style: 3,
}

const PropertyCard = ({ property }) => {
  // const { title } = props
  const {
    title, address, pricePrRoom, budget, propertySize, newness, style
  } = property
  return (
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
          <Label as="a">{NEWNESS_TO_TEXT[newness]}</Label>
          <Label as="a">{STYLE_TO_TEXT[style]}</Label>
        </Label.Group>
      </Card.Content>
    </Card>
  )
}

export default PropertyCard
