import React from 'react'
import {
  Image,
  Grid,
  Card,
} from 'semantic-ui-react'
import AddUserCard from '../Components/AddUserCard'

const Flatmates = (props) => {
  const { flatmates, showAddUserCard, userUid } = props
  const userData = flatmates.find(mate => userUid === mate.uid)
  return (
    <Grid.Row stretched>
      {flatmates.map(mate => (
        <Grid.Column
          key={mate.uid}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
        >
          <Card>
            <Image
              src={mate.photoURL}
              wrapped
              style={{
                    maxHeight: '21em',
                    maxWidth: '100%',
                    overflow: 'hidden'
                }}
            />
            <Card.Content>
              <Card.Header>
                {mate.displayName}
              </Card.Header>
              <Card.Meta>{mate.workplace.split(' ')[0]}</Card.Meta>
              <Card.Description>
                {`${mate.displayName} studied ${
                                        mate.studyProgramme
                                      } at ${mate.university}`}
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              {`${props.calculateSimilarityScoreBetweenUsers(
                    userData,
                    mate
                )}% match`}
            </Card.Content>
          </Card>
        </Grid.Column>
    ))}
      {showAddUserCard && (
      <Grid.Column
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
      >
        <AddUserCard
          addFlatmateToMatch={props.addFlatmateToMatch}
        />
      </Grid.Column>
    )}
    </Grid.Row>)
}

export default Flatmates
