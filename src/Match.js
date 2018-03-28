import React, { Component } from 'react'

import firebase, { auth } from './firebase'
import { Button, Image, Grid, Card, Segment, Container } from 'semantic-ui-react'
import ChatRoom from './ChatRoom'
import AddUserCard from './AddUserCard';
import uuid from 'uuid'

class Match extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.matchUnsubscribe = null
    this.state = {
      user: null,
      userData: null,
      flatmatesLoading: true,
      chatLoading: true,
      matchDoc: null,
      roommates: [],
      bestOrigin: '',
      currentMatchId: '',
      showChatRoom: true,
      showAddUserCard: false,
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
              this.matchUnsubscribe = firebase
                .firestore()
                .collection('matches')
                .doc(userData.currentMatchId)
                .onSnapshot(match => {
                  const matchData = match.data()
                  const bestOrigin = matchData.bestOrigin.length > 0 ? matchData.bestOrigin : matchData.location
                  this.setState({ matchDoc: match, currentMatchId: userData.currentMatchId, bestOrigin })
                  return Promise.all(
                    matchData
                      .flatMates
                      .map(mate => {
                        let collectionName = 'testUsers'
                        if (mate.uid.length === 28) {
                          collectionName = 'users'
                        }
                        return firebase
                          .firestore()
                          .collection(collectionName)
                          .doc(mate.uid)
                          .get()
                      }

                      )
                  ).then(results => {
                    const roommates = []
                    results.forEach(doc => {
                      const roommate = doc.data()
                      roommates.push(roommate)
                    })

                    this.setState({ roommates, flatmatesLoading: false })
                  })
                    .catch(error => console.log(error))
                })

            } else {
              this.setState({ flatmatesLoading: false, showChatRoom: false, roommates: [userData] })
            }
          })
      }
    })
  }

  componentWillUnmount() {
    this.matchUnsubscribe()
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

  calculateFlatScore = (roommates) => {
    const simScores = []
    for (let i = 0; i < roommates.length; i++) {
      const mate1 = roommates[i]
      for (let j = 0; j < roommates.length; j++) {
        const mate2 = roommates[j]
        if (i !== j) {
          let simScore = this.calculateSimScore(mate1, mate2)
          simScores.push(simScore)
        }
      }
    }

    let flatAverageScore = 100
    if (simScores.length > 1) {
      flatAverageScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
    }
    return flatAverageScore
  }

  addFlatmateToMatch = (userData) => {
    this.setState({ roommates: [...this.state.roommates, userData], showAddUserCard: false })
  }

  createNewMatchObject = () => {
    const { roommates } = this.state
    console.log(roommates)
    const match = {
      uid: uuid(),
      flatMates: roommates,
      location: "Oslo",
      bestOrigin: "",
      flatAverageScore: this.calculateFlatScore(roommates),
      custom: true,
    }
    firebase.firestore().collection('matches').doc(match.uid).set(match)
    roommates.forEach(mate => {
      firebase.firestore().collection('users').doc(mate.uid).update({ currentMatchId: match.uid, readyToMatch: false, })
    })

  }

  render() {
    const { flatmatesLoading, chatLoading, userData } = this.state

    // if (userData && userData.currentMatchId == null) {
    //   return (
    //     <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
    //       <Segment>You havent been matched yet, fill in your profile and set yourself ready</Segment>
    //     </Container>
    //   )
    // }

    /* 
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
        )} */
    console.log(this.state)

    return (
      <div>
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
          {this.state.user && (
            <div>
              <Segment loading={flatmatesLoading}>
                <h2>Here are your new (potential) flatmates</h2>
                <Grid stackable columns="equal" >
                  <Grid.Row stretched>
                    {this.state.roommates.map(
                      roommate =>
                        console.log(roommate) || (
                          <Grid.Column key={roommate.uid} style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <Card>
                              <Image src={roommate.photoURL} wrapped style={{maxHeight: '21em', maxWidth: '100%', overflow:'hidden' }} />
                              <Card.Content>
                                <Card.Header>roommate.displayName</Card.Header>
                                <Card.Meta>roommate.workplace</Card.Meta>
                                <Card.Description>{
                                  roommate.displayName +
                                  ' studied ' +
                                  roommate.studyProgramme +
                                  ' at ' +
                                  roommate.university
                                }</Card.Description>
                              </Card.Content>
                              <Card.Content extra>
                                {this.calculateSimScore(this.state.userData, roommate) + '% match'}
                              </Card.Content>
                            </Card>
                          </Grid.Column>
                        )
                    )}
                    {this.state.showAddUserCard && (
                      <Grid.Column style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <AddUserCard addFlatmateToMatch={this.addFlatmateToMatch} />
                      </Grid.Column>
                    )}
                  </Grid.Row>
                  <Grid.Row>

                    {this.state.roommates.length < 4 && (
                      <Grid.Column style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Button circular icon='add' onClick={() => this.setState({ showAddUserCard: true })} />
                      </Grid.Column>

                    )}
                  </Grid.Row>
                </Grid>
                <Button onClick={() => this.createNewMatchObject()} >Create new Match Object</Button>
              </Segment>
              <Segment textAlign="center">
                <h1>Your ideal origin is:</h1>
                <div>Address: {this.state.bestOrigin}</div>
              </Segment>
              {this.state.showChatRoom && (
                <Segment loading={!this.state.matchDoc}>
                  {this.state.matchDoc && <ChatRoom matchDoc={this.state.matchDoc} />}
                </Segment>
              )}
            </div>
          )}
        </Container>
      </div>
    )
  }
}

export default Match
