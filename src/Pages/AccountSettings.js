import React from 'react'
import { Container, Segment, Button } from 'semantic-ui-react'
import firebase from '../firebase'


async function deleteMyAccount() {
  const user = firebase.auth().currentUser

  await user.delete()
  await firebase.firestore().collection('users').doc(user.uid).delete()
}

const AccountSettings = () => (
  <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
    <Segment textAlign="center" >
      <Button negative onClick={deleteMyAccount} >Delete my account</Button>
    </Segment>
  </Container>
)

export default AccountSettings
