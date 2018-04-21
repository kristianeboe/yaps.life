import React from 'react'
import {
  Image,
  Card,
} from 'semantic-ui-react'
import personAvatar from '../assets/images/personAvatar.png'

const MateCard = ({
  mate, similarityScore
}) => {
  const {
    age, photoURL, displayName, workplace, studyProgramme, university, gender, matchLocation, propertyVector
  } = mate
  const [budget, propertySize, newness] = propertyVector
  const genderDisplay = gender === 'Male' ? 'He' : 'She'
  const budgetDisplay = budget === 1 ? 'cheaper' : budget === 3 ? '' : 'premium'
  const sizeDisplay = propertySize === 1 ? 'small' : propertySize === 3 ? '' : 'huge'
  const newnessDisplay = newness === 1 ? 'rustic' : newness === 3 ? 'modern' : 'brand new'
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
          {displayName}, {age}
        </Card.Header>
        <Card.Meta>{workplace.split(/[ ,]+/)[0]}</Card.Meta>
        <Card.Description>
          {`Studied ${studyProgramme} at ${university}`}
        </Card.Description>
        <Card.Description>
          {`Looking to move into a ${sizeDisplay}, ${budgetDisplay} apartment in ${matchLocation}. Prefers ${newnessDisplay} apartments.`}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        {`${similarityScore}% match`}
      </Card.Content>
    </Card>
  )
}


export default MateCard
