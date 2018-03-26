import React from 'react'
import {Container, Grid, Segment, Header, Card } from 'semantic-ui-react'
import signup from './assets/images/signup.jpg'
import match from './assets/images/match.jpg'
import live from './assets/images/live.jpg'

const Process = () => (
  <Container>
    <Segment vertical textAlign="center" style={{ padding: '5em 0em' }}>
      <Header as="h3" style={{ fontSize: '2em' }}>
        HVOR DU BOR OG HVEM DU BOR MED HAR UTROLIG MYE Å SI
      </Header>
      <p style={{ fontSize: '1.33em' }}>
        Vi matcher deg inn i et kollektiv med andre studenter med sommerjobb på tvers av bransjer, men med like
        preferanser. Siden vi vet du har sommerjobb kan vi anta at du både er betalingsdyktig og en god leietaker noe
        som vil gjøre det lettere å pitche deg inn for utleiere over hele byen.
      </p>
      <Grid columns={3} container stackable verticalAlign="middle">
        <Grid.Row>
          <Grid.Column>
            <Card image={signup} description="Step 1" />
          </Grid.Column>
          <Grid.Column>
            <Card image={match} description="Step 2" />
          </Grid.Column>
          <Grid.Column>
            <Card image={live} description="Step 3" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  </Container>
)

export default Process
