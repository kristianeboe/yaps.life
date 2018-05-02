import React from 'react'
import { Container, Image, Segment, Header, Card } from 'semantic-ui-react'
import signup from '../assets/images/signup.jpg'
import match from '../assets/images/match.jpg'
import live from '../assets/images/live.jpg'

const Process = () => (
  <Container id="process">
    <Segment vertical textAlign="center" style={{ padding: '5em 0em' }}>
      <Header as="h2">
        WHERE YOU LIVE AND WHO YOU LIVE WITH HAS A TREMENDOUS IMPACT ON YOUR LIFE
      </Header>
      <Header as="h4" >
        We match you into a shared household with other students with internships in Oslo for the summer, based on mutual preferences.
        Because you have a summer internship we can assume you have money to pay rent and will be a good tenant. This makes you very
        attractive for landlords throughout the city.
      </Header>
      <Header as="h3">
        PROCESS
      </Header>
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
                  Our AI algorithm matches you with several flatmates looking to move to the same location and
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
