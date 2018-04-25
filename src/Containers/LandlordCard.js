import React from 'react'
import { Card, Image, Rating, Header, Icon, List } from 'semantic-ui-react'
import personAvatar from '../assets/images/personAvatar.png'

const LandlordCard = ({ landlord }) => {
  const {
    photoURL,
    displayName,
    age,
    email,
    rating,
    phone,
  } = landlord

  return (
    <Card centered>
      <Image
        src={photoURL || personAvatar}
        wrapped
        style={{
            // width: '100%',
            // height: '100%',
        maxHeight: '21em',
        maxWidth: '100%',
         overflow: 'hidden',
         // objectFit: 'cover'
        }}
      />
      <Card.Content>
        <Card.Header>
          {displayName} {age ? `, ${age}` : '' }
        </Card.Header>
        <Card.Description>
          <List size="small" >
            <List.Item icon="mail" content={<a href={`mailto:${email}`}>{email}</a>} />
            {phone && <List.Item icon="phone" content={<a href={`tel:${phone}`}>{phone}</a>} />}
            <List.Item icon="linkedin square" content={<a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/kristianeboe/">linkedIn</a>} />
            <List.Item icon="linkify" content={<a href="http://kristianeboe.me">kristianeboe.me</a>} />
          </List>
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        Landlord rating:{'  '}
        <Rating disabled icon="star" defaultRating={rating} maxRating={5} />
      </Card.Content>
    </Card>
  )
}

export default LandlordCard
