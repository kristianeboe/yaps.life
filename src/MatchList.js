import React, { Component } from 'react'
import { Loader, Dimmer, Button, Container, Segment, List } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import uuid from 'uuid'
import firebase, { auth } from './firebase'


class MatchList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      matches: [],
      redirectToNewMatch: false,
      userData: null,
      userDoc: null,
      matchesLoading: true,
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        firebase.firestore().collection('users').doc(user.uid).get()
          .then((doc) => {
            const userData = doc.data()
            const matches = userData.currentMatches
            Promise.all(Object.keys(matches).map(matchId => (
              firebase.firestore().collection('matches').doc(matchId).get()
            ))).then(results => this.setState({
              matchesLoading: false, userData, userDoc: doc, matches: results.map(res => res.data())
            }))
          })
      }
    })
  }

  createNewMatchAndRedirect = () => {
    const match = {
      uid: uuid.v4(),
      flatmates: [this.state.userData],
      location: 'Oslo',
      bestOrigin: '',
      custom: true
    }
    firebase.firestore().collection('matches').doc(match.uid).set(match)
      .then(() => {
        this.state.userDoc.ref.update({ [`currentMatches.${match.uid}`]: Date.now() })
      })
      .then(() => this.setState({ redirectToNewMatch: true, match }))
  }

  render() {
    if (this.state.matchesLoading) {
      return (
        <Dimmer>
          <Loader />
        </Dimmer>)
    }
    if (this.state.redirectToNewMatch) {
      return <Redirect push to={`/matches/${this.state.match.uid}`} />
    }
    return (
      <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>

        {this.state.matches.map(match => console.log(match) || (
          <Segment key={match.uid} >
            <Link to={`/matches/${match.uid}`} >
              Hello match
            </Link>
          </Segment>
        ))}
        <Button onClick={this.createNewMatchAndRedirect} >Create new custom match</Button>
      </Container>
    )
  }
}

export default MatchList
