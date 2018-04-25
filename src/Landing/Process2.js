import React from 'react'
import { Container, Image, Segment, Header, Card, Grid } from 'semantic-ui-react'
import signup from '../assets/images/signup.jpg'
import match from '../assets/images/match.jpg'
import live from '../assets/images/live.jpg'

const Process2 = () => (
  <Container id="process">
    <Segment vertical textAlign="center" style={{ padding: '5em 0em' }}>
      <Grid columns="equal" textAlign="center" >
        <Grid.Row >
          <Grid.Column>
            <Header>
                For renters
            </Header>
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
          </Grid.Column>
          <Grid.Column>
            <Header>
                For landlords
            </Header>
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
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
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
          </Grid.Column>
          <Grid.Column>
            <Card centered>
              <Image src={live} />
              <Card.Content>
                <Card.Header>
                  Upload
                </Card.Header>
                <Card.Description>
                  After the match you will have an oportunity to chat with your new flatmates and decide if you want to move forward. You can take
                  the discussion of to another platform like Facebook or continue the discussion right here.
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
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
          </Grid.Column>
          <Grid.Column>
            <Card centered>
              <Image src={live} />
              <Card.Content>
                <Card.Header>
                  Find perfect tenants
                </Card.Header>
                <Card.Description>
                  After the match you will have an oportunity to chat with your new flatmates and decide if you want to move forward. You can take
                  the discussion of to another platform like Facebook or continue the discussion right here.
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
      </Grid>


    </Segment>
  </Container>
)

export default Process2
