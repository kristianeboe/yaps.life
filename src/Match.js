import React, { Component } from 'react'
import {
  Button,
  Image,
  Grid,
  Card,
  Segment,
  Container
} from 'semantic-ui-react'
import axios from 'axios'
import firebase, { auth } from './firebase'
import ChatRoom from './ChatRoom'
import AddUserCard from './AddUserCard'
import FlatRank from './FlatRank'

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
      flatmates: [],
      bestOrigin: '',
      currentMatchId: '',
      showChatRoom: true,
      showAddUserCard: false,
      matchData: {},
      propertyList: [],
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
      if (user) {
        this.subscribeToMatch(this.props.match.params.matchId)
        firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then((doc) => {
            const userData = doc.data()
            this.setState({
              userData,
              bestOrigin: 'Oslo'
            })
            return userData
          })
      }
    })
  }

  componentWillUnmount() {
    this.matchUnsubscribe()
  }

  subscribeToMatch = (matchId) => {
    this.matchUnsubscribe = firebase
      .firestore()
      .collection('matches')
      .doc(matchId)
      .onSnapshot((match) => {
        const matchData = match.data()
        console.log(matchData)
        const bestOrigin =
          matchData.bestOrigin.length > 0
            ? matchData.bestOrigin
            : matchData.location
        const propertyList = matchData.propertyList ?
          matchData.propertyList :
          []
        this.setState({
          matchDoc: match,
          currentMatchId: matchId,
          bestOrigin,
          matchData,
          propertyList
        })
        return Promise.all(matchData.flatmates.map((mate) => {
          let collectionName = 'testUsers'
          if (mate.uid.length === 28) {
            collectionName = 'users'
          }
          return firebase
            .firestore()
            .collection(collectionName)
            .doc(mate.uid)
            .get()
        }))
          .then((results) => {
            const flatmates = []
            results.forEach((doc) => {
              const flatmate = doc.data()
              flatmates.push(flatmate)
            })

            this.setState({
              flatmates,
              flatmatesLoading: false,
              showChatRoom: true
            })
          })
          .catch(error => console.log(error))
      })
  }

  createChatRoom = (matchDoc) => {
    const messagesRef = matchDoc.ref.collection('messages').orderBy('dateTime')
    this.unsubscribe = messagesRef.onSnapshot((snapshot) => {
      const messages = []
      snapshot.forEach((doc) => {
        messages.push(doc.data())
      })
      this.setState({ messages })
    })
  }

  calculateSimScore = (uData, vData) => {
    const u = []
    const v = []

    for (let q = 0; q < 20; q += 1) {
      u.push(uData[`q${q + 1}`])
      v.push(vData[`q${q + 1}`])
    }
    const magU = Math.sqrt(u.map(el => el * el).reduce((a, b) => a + b, 0))
    const magV = Math.sqrt(v.map(el => el * el).reduce((a, b) => a + b, 0))
    const sumVector = []
    for (let index = 0; index < u.length; index += 1) {
      const ui = u[index]
      const vi = v[index]
      sumVector.push(ui * vi)
    }
    const dotSum = sumVector.reduce((a, b) => a + b, 0)

    return Math.floor(dotSum / (magU * magV) * 100)
  }

  calculateFlatScore = (flatmates) => {
    const simScores = []
    for (let i = 0; i < flatmates.length; i += 1) {
      const mate1 = flatmates[i]
      for (let j = 0; j < flatmates.length; j += 1) {
        const mate2 = flatmates[j]
        if (i !== j) {
          const simScore = this.calculateSimScore(mate1, mate2)
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
    const flatmates = [...this.state.flatmates, userData]
    const flatAverageScore = this.calculateFlatScore(flatmates)
    const { matchId } = this.props.match.params
    this.setState({
      flatmates,
      showAddUserCard: false
    })
    firebase.firestore().collection('users').doc(userData.uid).update({ [`currentMatches.${matchId}`]: Date.now() })
    firebase.firestore().collection('matches').doc(matchId).update({ flatmates, flatAverageScore })
    if (flatmates.length > 2) {
      axios
        .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getBestOriginHTTPforMatch', { matchId })
        .then((response) => {
          console.log(response)
        })
    }
  }

  render() {
    const { flatmatesLoading, flatmates, propertyList } = this.state

    return (
      <div>
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
          {this.state.user && (
            <div>
              <Segment loading={flatmatesLoading}>
                <h2>Here are your new (potential) flatmates</h2>
                <Grid stackable columns="equal">
                  <Grid.Row stretched>
                    {flatmates.map(roommate =>
                        console.log(roommate) || (
                          <Grid.Column
                            key={roommate.uid}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <Card>
                              <Image
                                src={roommate.photoURL}
                                wrapped
                                style={{
                                  maxHeight: '21em',
                                  maxWidth: '100%',
                                  overflow: 'hidden'
                                }}
                              />
                              <Card.Content>
                                <Card.Header>
                                  {roommate.displayName}
                                </Card.Header>
                                <Card.Meta>{roommate.workplace}</Card.Meta>
                                <Card.Description>
                                  {`${roommate.displayName} studied ${
                                    roommate.studyProgramme
                                  } at ${roommate.university}`}
                                </Card.Description>
                              </Card.Content>
                              <Card.Content extra>
                                {`${this.calculateSimScore(
                                  this.state.userData,
                                  roommate
                                )}% match`}
                              </Card.Content>
                            </Card>
                          </Grid.Column>
                        ))}
                    {this.state.showAddUserCard && (
                      <Grid.Column
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <AddUserCard
                          addFlatmateToMatch={this.addFlatmateToMatch}
                        />
                      </Grid.Column>
                    )}
                  </Grid.Row>
                  <Grid.Row>
                    {this.state.flatmates.length < 5 && (
                      <Grid.Column
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Button
                          circular
                          icon="add"
                          onClick={() =>
                            this.setState({ showAddUserCard: true })
                          }
                        />
                      </Grid.Column>
                    )}
                  </Grid.Row>
                </Grid>
                {/* <Button onClick={() => this.createNewMatchObject()}>
                  Create new Match Object
                </Button> */}
              </Segment>
              <Grid columns="equal">
                <Grid.Column>
                  <Segment textAlign="center">
                    <h1>Your ideal origin is:</h1>
                    <div>Address: {this.state.bestOrigin}</div>
                    <h2>
                      <a
                        target="_blank"
                        href={this.state.matchData.finnQueryString}
                      >
                        Finn.no query
                      </a>
                    </h2>
                    <a
                      target="_blank"
                      href={this.state.matchData.airBnBQueryString}
                    >
                      <h2>AirBnB Query</h2>
                    </a>
                  </Segment>
                </Grid.Column>
                <Grid.Column>
                  <FlatRank matchDoc={this.state.matchDoc} flatmates={flatmates} propertyList={propertyList} />
                </Grid.Column>
              </Grid>
              {this.state.showChatRoom && (
                <Segment loading={!this.state.matchDoc}>
                  {this.state.matchDoc && (
                    <ChatRoom matchDoc={this.state.matchDoc} />
                  )}
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
