import React, { Component } from 'react'
import {
  Button,
  Grid,
  Segment,
  Container,
  Header,
  Label
} from 'semantic-ui-react'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import axios from 'axios'
import firebase, { auth } from '../firebase'
import ChatRoom from '../Components/ChatRoom'
import FlatRank from '../Components/FlatRank'
import Flatmates from '../Containers/Flatmates'
import FlatList from '../Containers/FlatList'

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

  getPropertyList = async propertyList => Promise.all(propertyList.map(async (property) => {
    if (property.listingId) {
      return firebase.firestore().collection('listings').doc(property.listingId).get()
        .then(doc => doc.data())
    }
    return property
  }))

  subscribeToMatch = async (matchId) => {
    this.matchUnsubscribe = firebase
      .firestore()
      .collection('matches')
      .doc(matchId)
      .onSnapshot(async (matchDoc) => {
        const match = matchDoc.data()
        const { flatmates } = match
        this.setState({
          matchDoc,
          flatmates,
          flatScore: match.flatScore,
          finnQueryString: match.finnQueryString,
          airBnBQueryString: match.airBnBQueryString,
          propertyAlignment: match.propertyAlignment,
          bestOrigin: match.bestOrigin.length > 0 && match.bestOrigin !== 'Could not determine, did not receive any origins' ? match.bestOrigin : match.location,
          flatmatesLoading: false,
          showChatRoom: true,
        })
        const propList = await this.getPropertyList(match.propertyList)
        console.log(propList)
        this.setState({
          propertyList: match.propertyList ? propList : [],

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

  createGroupPropertyVector = (flatmates) => {
    const groupVector = []
    const propertyVectors = flatmates.map(mate => mate.propertyVector)
    for (let i = 0; i < propertyVectors[0].length; i += 1) {
      let sum = 0
      for (let j = 0; j < flatmates.length; j += 1) {
        sum += propertyVectors[j][i]
      }
      groupVector.push(sum / propertyVectors.length)
    }
    return groupVector
  }

  mapPropScoreToPercentage = propScore => Math.floor((1 - (propScore / 48)) * 100)

  calculatePropertyAlignment = (flatmates) => {
    const propScores = []
    for (let i = 0; i < flatmates.length; i += 1) {
      const mate1 = flatmates[i]
      for (let j = 0; j < flatmates.length; j += 1) {
        const mate2 = flatmates[j]
        if (i !== j) {
          const propScore = euclidianDistanceSquared(mate1.propertyVector, mate2.propertyVector)
          propScores.push(this.mapPropScoreToPercentage(propScore))
        }
      }
    }

    let propertyAlignment = 100
    if (propScores.length > 1) {
      propertyAlignment = propScores.reduce((a, b) => a + b, 0) / propScores.length
    }
    return Math.floor(propertyAlignment)
  }

  addFlatmateToMatch = (userData) => {
    const flatmates = [...this.state.flatmates, userData]
    const flatScore = this.calculateFlatScore(flatmates)
    const propertyAlignment = this.calculatePropertyAlignment(flatmates)
    const groupPropertyVector = this.createGroupPropertyVector(flatmates)
    console.log(flatScore)
    const { matchId } = this.props.match.params
    this.setState({
      flatmates,
      propertyAlignment,
      groupPropertyVector,
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
    const {
      flatmatesLoading, flatmates, propertyList, finnQueryString, airBnBQueryString
    } = this.state
    console.log(this.state)
    return (
      <div style={{
    backgroundAttachment: 'fixed',
      backgroundPosition: 'center center',
      // backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
      backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
      backgroundSize: 'cover',
      boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
      }}
      >
        <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
          {this.state.user && (
            <div>
              <Segment loading={flatmatesLoading}>
                <Header as="h2">
                  Here are your new (potential) flatmates
                </Header>
                <Grid stackable columns="equal">
                  <Flatmates
                    flatmates={flatmates}
                    calculateSimilarityScoreBetweenUsers={this.calculateSimilarityScoreBetweenUsers}
                    addFlatmateToMatch={this.addFlatmateToMatch}
                    showAddUserCard={this.state.showAddUserCard}
                    userUid={this.state.user.uid}
                  />
                  <Grid.Row>
                    {this.state.flatmates.length < 4 && (
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
                        <span>You can add other users you know to the match by their email address</span>
                      </Grid.Column>
                    )}
                  </Grid.Row>
                </Grid>
                <Label as="a" color="blue" ribbon>Personality alignment: {this.state.flatScore} <br />Property alignment: {this.state.propertyAlignment}</Label>
              </Segment>
              <Grid stackable columns="equal">
                <Grid.Column>
                  <Segment>
                    <Header as="h3" dividing >
                        1. Get inspired!
                      <Header.Subheader>
                        Find cool apartments on finn.no or AirBnB
                      </Header.Subheader>
                    </Header>

                    <div>Based on your profiles you should narrow your search to: <h3> {this.state.bestOrigin}</h3></div>
                    <Grid columns="equal" >
                      <Grid.Column>
                        <h2>
                          <a
                            target="_blank"
                            href={finnQueryString || `https://www.finn.no/realestate/lettings/search.html?location=0.20061&no_of_bedrooms_from=${flatmates.length}&property_type=3`}
                          >
                        Finn.no
                          </a>
                        </h2>
                      </Grid.Column>
                      <Grid.Column>
                        <h2>
                          <a
                            target="_blank"
                            href={airBnBQueryString || `https://www.airbnb.com/s/Oslo--Norway/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJOfBn8mFuQUYRmh4j019gkn4&query=Oslo%2C%20Norway&allow_override%5B%5D=&min_bedrooms=${flatmates.length}`}
                          >
                      AirBnB
                          </a>
                        </h2>
                      </Grid.Column>
                    </Grid>
                  </Segment>
                  <FlatRank matchDoc={this.state.matchDoc} flatmates={flatmates} propertyList={propertyList} />
                </Grid.Column>
                <Grid.Column>
                  <FlatList flats={propertyList} />
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
