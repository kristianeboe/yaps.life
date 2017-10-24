import React from 'react'
import {
  Container,
  Grid,
  Image,
  Segment,
} from 'semantic-ui-react'

const Process = () => (
  <Segment>
    <Container>
      <Grid columns={3} stackable>
        <Grid.Column>
          <Image src="/assets/images/signup.jpg" size='medium'/>
          Steg 1
        </Grid.Column>
        <Grid.Column>
          <Image src="/assets/images/match.jpg" size='medium'/>
          Steg 2
          </Grid.Column>
        <Grid.Column>
          <Image src="/assets/images/live.jpg" size='medium'/>
          Steg 3
          </Grid.Column>
      </Grid>
    </Container>
  </Segment>
)

export default Process;