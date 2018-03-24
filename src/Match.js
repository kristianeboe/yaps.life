import React, { Component } from 'react'

import firebase, { auth } from './firebase'
import { Grid, Card, Segment, Container } from 'semantic-ui-react'
import ChatRoom from './ChatRoom'

class Match extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.state = {
      user: null,
      userData: null,
      flatmatesLoading: true,
      chatLoading: true,
      matchDoc: null,
      roommates: [],
      bestOrigin: '',
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      this.setState({ user })
      if (user) {
        firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then(doc => {
            const userData = doc.data()
            this.setState({
              userData,
              bestOrigin: 'Oslo',
            })
            return userData
          })
          .then(userData => {
            if (userData.currentMatchId) {
              firebase
                .firestore()
                .collection('matches')
                .doc(userData.currentMatchId)
                .get()
                .then(match => {
                  this.setState({ matchDoc: match })
                  return Promise.all(
                    match
                      .data()
                      .flatMates.filter(mate => mate !== user.uid)
                      .map(mate =>
                        firebase
                          .firestore()
                          .collection('testUsers')
                          .doc(mate)
                          .get()
                      )
                  )
                })
                .then(results => {
                  const roommates = []
                  results.forEach(doc => {
                    const roommate = doc.data()
                    roommates.push(roommate)
                  })

                  this.setState({ roommates, flatmatesLoading: false })
                })
                .catch(error => console.log(error))
            }
          })
      }
    })
  }

  createChatRoom = matchDoc => {
    const messagesRef = matchDoc.ref.collection('messages').orderBy('dateTime')
    this.unsubscribe = messagesRef.onSnapshot(snapshot => {
      const messages = []
      snapshot.forEach(doc => {
        messages.push(doc.data())
      })
      this.setState({ messages })
    })
  }

  calculateSimScore(uData, vData) {
    const u = []
    const v = []

    for (let q = 0; q < 20; q++) {
      u.push(uData['q' + (q + 1)])
      v.push(vData['q' + (q + 1)])
    }
    const mag_u = Math.sqrt(u.map(el => el * el).reduce((a, b) => a + b, 0))
    const mag_v = Math.sqrt(v.map(el => el * el).reduce((a, b) => a + b, 0))
    const sum_vector = []
    for (let index = 0; index < u.length; index++) {
      const ui = u[index]
      const vi = v[index]
      sum_vector.push(ui * vi)
    }
    const dot_sum = sum_vector.reduce((a, b) => a + b, 0)

    return Math.floor(dot_sum / (mag_u * mag_v) * 100)
  }

  render() {
    const { flatmatesLoading, chatLoading, userData } = this.state

    if (userData && userData.currentMatchId == null) {
      return (
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
          <Segment>You havent been matched yet, fill in your profile and set yourself ready</Segment>
        </Container>
      )
    }

    console.log(this.state)

    return (
      <div>
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
          {this.state.user && (
            <div>
              <Segment loading={flatmatesLoading}>
                <h2>Here are your new (potential) flatmates</h2>
                <Grid stackable columns="equal">
                  {this.state.userData && (
                    <Grid.Column>
                      <Card
                        image={userData.photoURL}
                        header={userData.displayName}
                        meta={userData.workplace.substr(0, userData.workplace.indexOf(','))}
                        description={
                          this.state.userData.displayName +
                          ' studied ' +
                          this.state.userData.studyProgramme +
                          ' at ' +
                          this.state.userData.university
                        }
                        extra={this.calculateSimScore(this.state.userData, this.state.userData) + '% match'}
                        // extra={extra}
                      />
                    </Grid.Column>
                  )}
                  {this.state.roommates.map(roommate => (
                    <Grid.Column key={roommate.uid}>
                      <Card
                        image={roommate.photoURL}
                        header={roommate.displayName}
                        meta={roommate.workplace}
                        description={
                          roommate.displayName + ' studied ' + roommate.studyProgramme + ' at ' + roommate.university
                        }
                        // description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                        extra={this.calculateSimScore(this.state.userData, roommate) + '% match'}
                      />
                    </Grid.Column>
                  ))}
                </Grid>
              </Segment>
              <Segment textAlign="center">
                <h1>Your ideal origin is:</h1>
                <div>Address: {this.state.bestOrigin}</div>
              </Segment>
              <Segment loading={!this.state.matchDoc}>
                {this.state.matchDoc && <ChatRoom matchDoc={this.state.matchDoc} />}
              </Segment>
            </div>
          )}
        </Container>
      </div>
    )
  }
}

export default Match
