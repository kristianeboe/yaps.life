import React from 'react'
import {
  Grid,
  Image,
  Segment,
  Header,
} from 'semantic-ui-react'

const Process = () => (
  <Segment vertical textAlign='center' style={{ padding: '5em 0em' }} >
    <Grid columns={3} container stackable verticalAlign='middle'>
      <Header as='h3' style={{ fontSize: '2em' }}>HVOR DU BOR OG HVEM DU BOR MED HAR UTROLIG MYE Å SI</Header>
      <p style={{ fontSize: '1.33em' }}>
      Vi matcher deg inn i et kollektiv med andre studenter med sommerjobb på tvers av bransjer, men med like preferanser. 
      Siden vi vet du har sommerjobb kan vi anta at du både er betalingsdyktig og en god leietaker noe som vil gjøre det 
      lettere å pitche deg inn for utleiere over hele byen.
      </p>
      <Grid.Row>
        <Grid.Column>
          <Image src="/assets/images/signup.jpg" />
          Steg 1
        </Grid.Column>
        <Grid.Column>
          <Image src="/assets/images/match.jpg" />
          Steg 2
          </Grid.Column>
        <Grid.Column>
          <Image src="/assets/images/live.jpg" />
          Steg 3
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Segment>
)

export default Process;