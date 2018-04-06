import React from 'react'
import {
  Image,
  Card,
} from 'semantic-ui-react'

const MateCard = ({
  photoURL, displayName, workplace, studyProgramme, university, similarityScore, gender, budget, matchLocation
}) => {
  const budgetDisplay = budget > 2 ? 'premium' : 'normal'
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
          {`${gender ? 'He' : 'She'} is looking to move into a ${budgetDisplay} apartment in ${matchLocation}`}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        {`${similarityScore}% match`}
      </Card.Content>
    </Card>
  )
}


export default MateCard
