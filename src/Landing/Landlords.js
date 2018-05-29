import React from 'react'
import { Segment, Container, Header } from 'semantic-ui-react'

const Landlords = () => (
  <Container>
    <Segment vertical style={{ padding: '5em 0em' }}>
      <Header size="large">
        Looking to rent out your home this summer?
      </Header>
      <p>You can link you existing listings to this service or upload new listings by clicking Upload listing in the menu bar, just create a profile first. </p>
    </Segment>
  </Container>
)

export default Landlords
