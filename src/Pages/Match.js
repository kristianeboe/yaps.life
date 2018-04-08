import React, { Component } from 'react'
import {
  Button,
  Grid,
  Segment,
  Container
} from 'semantic-ui-react'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import axios from 'axios'
import firebase, { auth } from '../firebase'
import ChatRoom from '../Components/ChatRoom'
import FlatRank from '../Components/FlatRank'
import Flatmates from '../Containers/Flatmates'

class Match extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.matchUnsubscribe = null
    this.state = {
      user: null,
      flatmatesLoading: true,
      chatLoading: true,
      matchDoc: null,
      flatmates: [],
      bestOrigin: '',
      showChatRoom: true,
      showAddUserCard: false,
      matchData: {},
      flatScore: 0,
      propertyAlignment: 0,
      propertyList: [],
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
      if (user) {
        this.subscribeToMatch(this.props.match.params.matchId)
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
      .onSnapshot((matchDoc) => {
        const match = matchDoc.data()
        const { flatmates } = match
        this.setState({
          matchDoc,
          flatmates,
          flatScore: match.flatScore,
          propertyAlignment: match.propertyAlignment,
          bestOrigin: match.bestOrigin.length > 0 ? match.bestOrigin : match.location,
          propertyList: match.propertyList ? match.propertyList : [],
          flatmatesLoading: false,
          showChatRoom: true,
        })
      })
  }

  mapSimScoreToPercentage = simScore => Math.floor((1 - (simScore / 320)) * 100)

  calculateSimilarityScoreBetweenUsers = (uData, vData) => {
    const u = uData.answerVector
    const v = vData.answerVector

    const vectorDistance = euclidianDistanceSquared(u, v)
    const simScore = this.mapSimScoreToPercentage(vectorDistance)

    return simScore
  }

  calculateFlatScore = (flatmates) => {
    const simScores = []
    for (let i = 0; i < flatmates.length; i += 1) {
      const mate1 = flatmates[i]
      for (let j = 0; j < flatmates.length; j += 1) {
        const mate2 = flatmates[j]
        if (i !== j) {
          const simScore = this.calculateSimilarityScoreBetweenUsers(mate1, mate2)
          simScores.push(simScore)
        }
      }
    }

    let flatScore = 100
    if (simScores.length > 1) {
      flatScore = simScores.reduce((a, b) => a + b, 0) / simScores.length
    }
    return Math.floor(flatScore)
  }

  addFlatmateToMatch = (userData) => {
    const flatmates = [...this.state.flatmates, userData]
    const flatScore = this.calculateFlatScore(flatmates)
    console.log(flatScore)
    const { matchId } = this.props.match.params
    this.setState({
      flatmates,
      showAddUserCard: false
    })
    firebase.firestore().collection('users').doc(userData.uid).update({ [`currentMatches.${matchId}`]: Date.now() })
    firebase.firestore().collection('matches').doc(matchId).update({ flatmates, flatScore })
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
    console.log(this.state)
    return (
      <div>
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
          {this.state.user && (
            <div>
              <Segment loading={flatmatesLoading}>
                <h2>Here are your new (potential) flatmates</h2>
                <Grid stackable columns="equal">
                  <Flatmates
                    flatmates={flatmates}
                    calculateSimilarityScoreBetweenUsers={this.calculateSimilarityScoreBetweenUsers}
                    addFlatmateToMatch={this.addFlatmateToMatch}
                    showAddUserCard={this.state.showAddUserCard}
                    userUid={this.state.user.uid}
                  />
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
                  <Grid.Row>
                    <Grid.Column>
                      Personality alignment {this.state.flatScore}
                    </Grid.Column>
                    <Grid.Column>
                      Property alignment {this.state.propertyAlignment}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                {/* <Button onClick={() => this.createNewMatchObject()}>
                  Create new Match Object
                </Button> */}
              </Segment>
              <Grid stackable columns="equal">
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
