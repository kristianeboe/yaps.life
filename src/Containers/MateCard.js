import React from 'react'
import {
  Image,
  Card,
  Icon,
  List,
} from 'semantic-ui-react'
import personAvatar from '../assets/images/personAvatar.png'

const MateCard = ({
  mate, similarityScore
}) => {
  const {
    age, photoURL, displayName, workplace, fieldOfStudy, university, gender, matchLocation, propertyVector, linkedInURL
  } = mate
  const [budget, propertySize, standard] = propertyVector
  const genderDisplay = gender === 'Male' ? 'He' : 'She'
  const budgetDisplay = budget === 1 ? 'cheaper' : budget === 3 ? '' : 'premium'
  const sizeDisplay = propertySize === 1 ? 'small' : propertySize === 3 ? '' : 'huge'
  const standardDisplay = standard === 1 ? 'rustic' : standard === 3 ? 'modern' : 'brand new'
  let workplaceDisplay = workplace.split(/[AS,]+/)
  if (workplaceDisplay[0].toLowerCase() === 'the') {
    workplaceDisplay = `${workplaceDisplay[0]} ${workplaceDisplay[1]}`
  } else {
    workplaceDisplay = workplaceDisplay[0]
  }
  return (
    <Card centered >
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
          {displayName} {age ? `, ${age}` : ''}
        </Card.Header>
        {workplace && (
        <Card.Meta>
          <div>
            <Icon name="building" />{' '}
            {workplaceDisplay}
          </div>
          <div>
            <Icon name="student" />{' '}
            {`${fieldOfStudy}, ${university}`}
          </div>
        </Card.Meta>
        )}
        {displayName && (
        <Card.Description>
          {`Looking to move into a ${sizeDisplay}, ${budgetDisplay} apartment in ${matchLocation}. Prefers ${standardDisplay} apartments.`}
        </Card.Description>
        )}
      </Card.Content>
      <Card.Content extra>
        <List>
          <List.Item icon="tasks" content={`${similarityScore}% match`} />
          {linkedInURL && <List.Item icon="linkedin" content={<a href={linkedInURL}>LinkedIn</a>} />}
        </List>
      </Card.Content>
    </Card>
  )
}


export default MateCard
