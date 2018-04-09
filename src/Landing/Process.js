import React from 'react'
import { Container, Image, Grid, Segment, Header, Card } from 'semantic-ui-react'
import signup from '../assets/images/signup.jpg'
import match from '../assets/images/match.jpg'
import live from '../assets/images/live.jpg'

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
      <Card.Group >
        <Card centered>
          <Image src={signup} />
          <Card.Content>
            <Card.Header>
                  Sign up
            </Card.Header>
            <Card.Description>
                  Sign up and answer 20 questions about your behaviour in shared flats as well as some budget and location info.
            </Card.Description>
          </Card.Content>
        </Card>
        <Card centered>
          <Image src={match} />
          <Card.Content>
            <Card.Header>
                  Get matched
            </Card.Header>
            <Card.Description>
                  Our AI algorithm matches you with one or several flatmates looking to move to the same location and
                  recommends you where in the city you should start looking. You can also evaluate individual addresses for you and your potential new flatmates.
            </Card.Description>
          </Card.Content>
        </Card>
        <Card centered>
          <Image src={live} />
          <Card.Content>
            <Card.Header>
                  Move in
            </Card.Header>
            <Card.Description>
                  After the match you will have an oportunity to chat with your new flatmates and decide if you want to move forward. You can take
                  the discussion of to another platform like Facebook or continue the discussion right here.
            </Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    </Segment>
  </Container>
)

export default Process
