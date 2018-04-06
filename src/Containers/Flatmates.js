import React from 'react'
import { Grid, } from 'semantic-ui-react'
import AddUserCard from '../Components/AddUserCard'
import MateCard from '../Components/MateCard'
import personAvatar from '../assets/images/personAvatar.png'

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
          <MateCard
            photoURL={mate.photoURL || personAvatar}
            displayName={mate.displayName}
            workplace={mate.workplace}
            studyProgramme={mate.studyProgramme}
            university={mate.university}
            gender={mate.gender}
            budget={mate.budget}
            size={mate.size}
            newness={mate.newness}
            matchLocation={mate.matchLocation}
            similarityScore={props.calculateSimilarityScoreBetweenUsers(userData, mate)}
          />
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
