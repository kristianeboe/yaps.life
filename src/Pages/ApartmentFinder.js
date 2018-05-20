import React, { Component } from 'react'
import {
  Button,
  Grid,
  Segment,
  Container,
  Header,
  Label,
  Dimmer,
  Loader,
  Card
} from 'semantic-ui-react'
import axios from 'axios'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import { calculateSimilarityScoreBetweenUsers, calculateFlatScore, createGroupPropertyVector, calculatePropertyAlignment } from '../utils/alignMentFunctions'
import { auth, firestore } from '../firebase'
import ChatRoom from '../Components/ChatRoom'
import FlatRank from '../Components/FlatRank'
import Flatmates from '../Containers/Flatmates'
import FlatList from '../Containers/FlatList'
import MateCard from '../Containers/MateCard'

export default class ApartmentFinder extends Component {
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


  getPropertyList = async (currentListings, groupPropertyVector) => Promise.all(Object.values(currentListings).map(async (listing) => {
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
          title, flatmates, flatScore, finnQueryString, airBnBQueryString, propertyAlignment, groupPropertyVector, bestOrigin, currentListings, location
        } = matchDoc.data()
        this.setState({
          matchTitle: title,
          matchDoc,
          flatmates,
          flatScore,
          groupPropertyVector,
          finnQueryString,
          airBnBQueryString,
          propertyAlignment,
          bestOrigin: bestOrigin.length > 0 && bestOrigin !== 'Could not determine, did not receive any origins' ? bestOrigin : location,
          flatmatesLoading: false,
          showChatRoom: true,
        })
        const matchPropertyList = await this.getPropertyList(currentListings, groupPropertyVector)
        this.setState({
          propertyList: matchPropertyList,
        })
      })
  }

  addFlatmateToMatch = (userData) => {
    const flatmates = [...this.state.flatmates, userData]
    const flatScore = calculateFlatScore(flatmates)
    const propertyAlignment = calculatePropertyAlignment(flatmates)
    const groupPropertyVector = createGroupPropertyVector(flatmates)
    const matchTitle = flatmates.length === 2 ? 'The Dynamic Duo' : flatmates.length === 3 ? 'Triple threat' : flatmates.length === 4 ? 'Fantastic Four' : flatmates.length === 5 ? 'The Quintessentials' : flatmates.length === 6 ? 'The Avengers' : 'The Horde'
    console.log(flatScore)
    const { matchId } = this.props.match.params
    this.setState({
      flatmates,
      propertyAlignment,
      groupPropertyVector,
      showAddUserCard: false
    })
    firestore.collection('users').doc(userData.uid).update({ [`currentMatches.${matchId}`]: Date.now() })
    firestore.collection('matches').doc(matchId).update({
      flatmates, flatScore, propertyAlignment, groupPropertyVector, title: matchTitle
    })
    if (flatmates.length > 2) {
      axios
        .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getBestOriginForMatchHTTPS', { matchId })
        .then((response) => {
          console.log(response)
        })
    }
  }

  render() {
    const {
      matchTitle, flatmatesLoading, flatmates, propertyList, finnQueryString, airBnBQueryString
    } = this.state


    if (!this.state.user) {
      return <div />
    }

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
        <Grid style={{ paddingTop: '5vh', paddingBottom: '5vh' }} >
          <Grid.Column widescreen="3" >
            <Segment loading={flatmatesLoading} style={{ overflow: 'auto', maxHeight: '87vh' }} >
              <Header as="h1">
                {matchTitle}
                <Header.Subheader>
            Here are your new (potential) flatmates, there is a chat where you can communicate at the bottom of this page.
                </Header.Subheader>
              </Header>
              <Label as="a" color="blue" ribbon>Personality alignment: {this.state.flatScore} <br />Property alignment: {this.state.propertyAlignment}</Label>
              <Card.Group centered >
                {flatmates.map(mate =>
                (<MateCard
                  mate={mate}
                  // similarityScore={props.calculateSimilarityScoreBetweenUsers(userData, mate)}
                />))}
              </Card.Group>
              {/* <Grid stackable columns="equal">

                <Flatmates
                flatmates={flatmates}
                calculateSimilarityScoreBetweenUsers={calculateSimilarityScoreBetweenUsers}
                addFlatmateToMatch={this.addFlatmateToMatch}
                showAddUserCard={this.state.showAddUserCard}
                userUid={this.state.user.uid}
              />
              </Grid> */}

            </Segment>
          </Grid.Column>
          <Grid.Column widescreen="3">
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
          <Grid.Column widescreen="4" >
            <Segment style={{ overflow: 'auto', maxHeight: '87vh' }} >
              <Header as="h3" dividing >
                        3. See your list of options here, sorted by average commute time and group score
                <Header.Subheader>
                        The ones already here are the some listings from Finn.no, feel free to add more.
                </Header.Subheader>
              </Header>
              {propertyList.length === 0 &&
              <Segment style={{ minHeight: '4em' }} loading={propertyList.length === 0} />
                  }
              <FlatList matchDoc={this.state.matchDoc} flats={propertyList} />
            </Segment>
          </Grid.Column>
          <Grid.Column />
        </Grid>
      </div>
    )
  }
}
