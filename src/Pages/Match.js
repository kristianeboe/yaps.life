import React, { Component } from 'react'
import {
  Button,
  Grid,
  Segment,
  Container,
  Header,
  Label,
} from 'semantic-ui-react'
import axios from 'axios'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import { calculateSimilarityScoreBetweenUsers, createGroupPropertyVector, calculateAlignment } from '../utils/alignMentFunctions'
import { auth, firestore } from '../firebase'
import ChatRoom from '../Components/ChatRoom'
import FlatRank from '../Components/FlatRank'
import Flatmates from '../Containers/Flatmates'
import FlatList from '../Containers/FlatList'
import PropertyCard from '../Containers/PropertyCard'

/* const getListingScore = (commuteTime, groupPropertyVector, propertyVector) => {
  const weights = [0.3, 0.3, 0.2, 0.1, 0.1]
  const commuteScore = commuteTime < 700 ? 5 : commuteTime < 1500 ? 4 : commuteTime < 2600 ? 2 : 1

  const expandedGroupVector = [4].concat(groupPropertyVector)
  const expandedPropertyVector = [commuteScore].concat(propertyVector)

  const listingScore = euclidianDistanceSquared(expandedGroupVector, expandedPropertyVector)

  const WexpandedGroupVector = expandedGroupVector.map((el, i) => el * weights[i])
  const WexpandedPropertyVector = expandedPropertyVector.map((el, i) => el * weights[i])

  const WlistingScore = euclidianDistanceSquared(WexpandedGroupVector, WexpandedPropertyVector)

  console.log(listingScore, WlistingScore)

  return WlistingScore
} */

class Match extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.matchUnsubscribe = null
    this.state = {
      matchTitle: '',
      user: null,
      flatmatesLoading: true,
      flatsLoading: true,
      chatLoading: true,
      matchDoc: null,
      flatmates: [],
      groupPropertyVector: [],
      bestOrigin: '',
      showChatRoom: true,
      showAddUserCard: false,
      matchData: {},
      personalityAlignment: 0,
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


  getPropertyList = async (currentListings, groupPropertyVector) => Promise.all(Object.keys(currentListings).map(async (listingKey) => {
    const listing = currentListings[listingKey]
    if (listing.source === 'external') {
      // const listingScore = getListingScore(listing.commuteTime, groupPropertyVector, listing.listingData.propertyVector)
      return { ...listing }
    }
    const listingDoc = await firestore.collection('listings').doc(listing.listingId).get()
    const listingData = listingDoc.data()
    // const listingScore = getListingScore(listing.commuteTime, groupPropertyVector, listingData.propertyVector)
    return {
      listingData, listingId: listing.listingId, commuteTime: listing.commuteTime, groupScore: listing.groupScore, listingScore: listing.listingScore
    }
  }))

  subscribeToMatch = async (matchId) => {
    this.matchUnsubscribe = firestore
      .collection('matches')
      .doc(matchId)
      .onSnapshot(async (matchDoc) => {
        const {
          title, flatmates, personalityAlignment, finnQueryString, airBnBQueryString, propertyAlignment, groupPropertyVector, bestOrigin, currentListings, location
        } = matchDoc.data()
        this.setState({
          matchTitle: title,
          matchDoc,
          flatmates,
          personalityAlignment,
          groupPropertyVector,
          finnQueryString,
          airBnBQueryString,
          propertyAlignment,
          bestOrigin: bestOrigin.length > 0 && bestOrigin !== 'Could not determine, did not receive any origins' ? bestOrigin : location,
          flatmatesLoading: false,
          showChatRoom: true,
        })
        console.log('currentListings', currentListings)
        const matchPropertyList = await this.getPropertyList(currentListings, groupPropertyVector)
        this.setState({
          propertyList: matchPropertyList,
        })
      })
  }

  calculateAlignment = (flatmates, feature, combine = []) => {
    const similarityDistances = []

    for (let i = 0; i < flatmates.length; i += 1) {
      const mate1 = flatmates[i]
      for (let j = 0; j < flatmates.length; j += 1) {
        if (i !== j) {
          const mate2 = flatmates[j]
          if (combine.length > 0) {
            const similarityDistance = euclidianDistanceSquared(mate1[combine[0]].concat(mate1[combine[1]]), mate2[combine[0]].concat(mate2[combine[1]]))
            similarityDistances.push(similarityDistance)
          } else {
            const similarityDistance = euclidianDistanceSquared(mate1[feature], mate2[feature]) // calculateSimilarityScoreBetweenUsers(mate1, mate2)
            similarityDistances.push(similarityDistance)
          }
        }
      }
    }

    let distance = 0
    if (similarityDistances.length > 1) {
      distance = similarityDistances.reduce((a, b) => a + b, 0) / similarityDistances.length
    }
    return Math.floor(distance)
  }

  addFlatmateToMatch = async (userData) => {
    const flatmates = [...this.state.flatmates, userData]
    const personalityAlignment = calculateAlignment(flatmates, 'personalityVector')
    const propertyAlignment = calculateAlignment(flatmates, 'propertyVector')
    const groupPropertyVector = createGroupPropertyVector(flatmates)
    const matchTitle = flatmates.length === 2 ? 'The Dynamic Duo' : flatmates.length === 3 ? 'Triple threat' : flatmates.length === 4 ? 'Fantastic Four' : flatmates.length === 5 ? 'The Quintessentials' : flatmates.length === 6 ? 'The Avengers' : 'The Horde'
    console.log(personalityAlignment)
    const { matchId } = this.props.match.params
    this.setState({
      flatmates,
      propertyAlignment,
      groupPropertyVector,
      showAddUserCard: false
    })
    firestore.collection('users').doc(userData.uid).update({ [`currentMatches.${matchId}`]: { matchId, timeStamp: new Date() } })
    await firestore.collection('matches').doc(matchId).update({
      flatmates, personalityAlignment, propertyAlignment, groupPropertyVector, title: matchTitle, currentListings: {},
    })

    axios.post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getBestOriginForMatchHTTPS', { matchId })
  }

  render() {
    const {
      matchTitle, flatmatesLoading, flatmates, propertyList, finnQueryString, airBnBQueryString
    } = this.state

    console.log(flatmates)

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

                <Header as="h1">
                  {matchTitle}
                  <Header.Subheader>
                  Here are your new (potential) flatmates, there is a chat where you can communicate at the bottom of this page.
                  </Header.Subheader>
                </Header>
                <Grid stackable columns="equal">
                  <Flatmates
                    flatmates={flatmates}
                    calculateSimilarityScoreBetweenUsers={calculateSimilarityScoreBetweenUsers}
                    addFlatmateToMatch={this.addFlatmateToMatch}
                    showAddUserCard={this.state.showAddUserCard}
                    userUid={this.state.user.uid}
                  />
                  <Grid.Row>
                    <Grid.Column
                      style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                    >
                      <Segment.Group horizontal>
                        <Segment>Budget: {this.state.groupPropertyVector[0]}</Segment>
                        <Segment>Size: {this.state.groupPropertyVector[1]}</Segment>
                        <Segment>Standard: {this.state.groupPropertyVector[2]}</Segment>
                        <Segment>Style: {this.state.groupPropertyVector[3]}</Segment>
                      </Segment.Group>
                    </Grid.Column>
                  </Grid.Row>
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
                <Label as="a" color="blue" ribbon>Personality alignment: {Math.floor((1 - this.state.personalityAlignment / 2) * 100)} <br />Property alignment: {Math.floor((1 - this.state.propertyAlignment / 2) * 100)}</Label>
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
                            href={finnQueryString || `https://www.finn.no/realestate/lettings/search.html?location=0.20061&no_of_bedrooms_from=${flatmates.length}&property_type=${flatmates.length === 1 ? '17' : '3'}`}
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
                  <FlatRank matchDoc={this.state.matchDoc} flatmates={flatmates} />
                </Grid.Column>
                <Grid.Column>
                  <Segment style={{ overflow: 'auto', maxHeight: '54em' }} >
                    <Header as="h3" dividing >
                        3. See your list of options here, sorted by average commute time and group score
                      <Header.Subheader>
                        The ones already here are the some listings from Finn.no, feel free to add more.
                      </Header.Subheader>
                    </Header>
                    {propertyList.length === 0 &&
                    <PropertyCard
                      key="default"
                      property={{
                      title: 'Demo listing', address: 'demo address', pricePerRoom: 2500, propertyVector: [1, 2, 3, 4], listingURL: 'default', showChat: false, rentFrom: new Date(), rentTo: null, numberOfBedrooms: flatmates.length
                     }}
                      commuteTime="commute time"
                      groupScore={3}
                      listingScore={3}
                      listingId="234123123123123123"
                      matchId="341234123123123123"
                      index={0}
                      matchDoc={this.state.matchDoc || { data: () => [] }}
                      landlord={false}
                      fastest
                      cheapest={false}
                    />
                  }
                    <FlatList matchDoc={this.state.matchDoc} flats={propertyList} />
                  </Segment>
                </Grid.Column>
              </Grid>
              {this.state.showChatRoom && (
                <Segment loading={!this.state.matchDoc} style={{ minHeight: '4em' }} >
                  {this.state.matchDoc && (
                    <ChatRoom groupChat matchId={this.state.matchDoc.id} />
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
