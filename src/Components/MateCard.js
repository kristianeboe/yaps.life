import React from 'react'
import {
  Image,
  Card,
} from 'semantic-ui-react'

const MateCard = ({
  photoURL, displayName, workplace, studyProgramme, university, similarityScore, gender, budget, matchLocation, size, newness,
}) => {
  const genderDisplay = gender === 'Gutt' ? 'He' : 'She'
  const budgetDisplay = budget > 2 ? 'premium' : 'cheaper'
  const sizeDisplay = size > 2 ? 'huge' : 'smaller'
  const newnessDisplay = newness > 2 ? 'modern, high end' : 'classical, old fashioned'
  return (
    <Card>
      <Image
        src={photoURL}
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
          {displayName}
        </Card.Header>
        <Card.Meta>{workplace.split(/[ ,]+/)[0]}</Card.Meta>
        <Card.Description>
          {`Studied ${studyProgramme} at ${university}`}
        </Card.Description>
        <Card.Description>
          {`${genderDisplay} is looking to move into a ${sizeDisplay},${budgetDisplay} apartment in ${matchLocation}. Prefers ${newnessDisplay} apartments.`}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        {`${similarityScore}% match`}
      </Card.Content>
    </Card>
  )
}


export default MateCard
