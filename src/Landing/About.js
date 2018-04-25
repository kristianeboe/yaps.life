import React from 'react'
import { Segment, Container, Grid, Card, Header, List } from 'semantic-ui-react'

const extra = (
  <List size="small" >
    <List.Item icon="mail" content={<a href="mailto:kristian.e.boe@gmail.com">hello@yaps.life</a>} />
    <List.Item icon="linkedin square" content={<a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/kristianeboe/">linkedIn</a>} />
    <List.Item icon="linkify" content={<a href="http://kristianeboe.me">kristianeboe.me</a>} />
  </List>
)
const About = () => (
  <Segment inverted style={{ paddingTop: '10vh', paddingBottom: '10vh' }} >
    <Container>
      <Grid columns="equal" stackable >
        <Grid.Column >
          <Header as="h2" inverted >About</Header>
          <List size="huge" >
            <List.Item icon="users" content="Yaps.life" />
            <List.Item icon="marker" content="Oslo, Norway" />
            <List.Item icon="mail" content={<a href="mailto:hello@yaps.life">hello@yaps.life</a>} />
            <List.Item icon="linkify" content={<a href="http://www.semantic-ui.com">semantic-ui.com</a>} />
          </List>
        </Grid.Column>
        <Grid.Column >
          <div>
            <div style={{ textAlign: 'center' }} >Created by</div>
            <Card
              centered
              image="https://lh5.googleusercontent.com/-2HYA3plx19M/AAAAAAAAAAI/AAAAAAAA7Nw/XWJkYEc6q6Q/photo.jpg"
              header="Kristian Elset Bø"
              meta="Founder of Yaps.life"
              description="Kristian created yaps.life as part of his master thesis at NTNU in 2018"
              extra={extra}
            />
          </div>
        </Grid.Column>
      </Grid>
    </Container>
  </Segment>
)

export default About
