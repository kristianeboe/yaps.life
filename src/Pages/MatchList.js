import React, { Component } from 'react'
import { Loader, Image, Dimmer, Button, Container, Segment, List, Progress } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import uuid from 'uuid'
import _ from 'underscore'
import firebase, { auth } from '../firebase'
import personAvatar from '../assets/images/personAvatar.png'

const fakeMatch = {
  uid: 'Getting cloud matched',
  flatmates: [{
    photoURL: personAvatar, uid: 't1', displayName: 'cloud', workplace: 'cloud'
  }, {
    photoURL: personAvatar, uid: 't2', displayName: 'cloud', workplace: 'cloud'
  }, {
    photoURL: personAvatar, uid: 't3', displayName: 'cloud', workplace: 'cloud'
  }, {
    photoURL: personAvatar, uid: 't4', displayName: 'cloud', workplace: 'cloud'
  }],
  flatScore: 100,
  location: 'Oslo',
  bestOrigin: '',
  custom: true,
  createdAt: ''
}

class MatchList extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.state = {
      matches: [],
      redirectToNewMatch: false,
      userData: null,
      userDoc: null,
      matchesLoading: true,
      gettingCloudMatched: false,
      loadingPercent: 0,
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.unsubscribe = firebase.firestore().collection('users').doc(user.uid).onSnapshot((doc) => {
          const userData = doc.data()
          const matches = userData.currentMatches ? userData.currentMatches : {}

          this.setState({ gettingCloudMatched: userData.gettingCloudMatched })

          Promise.all(Object.keys(matches).map(matchId => firebase.firestore().collection('matches').doc(matchId).get()))
            .then(results => this.setState({
              matchesLoading: false,
              userData,
              userDoc: doc,
              matches: results.map(res => res.data())
            }))
        })
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }
  createNewMatchAndRedirect = () => {
    const match = {
      uid: uuid.v4(),
      flatmates: [this.state.userData],
      flatScore: 100,
      location: 'Oslo',
      bestOrigin: '',
      custom: true,
      createdAt: new Date()
    }
    firebase.firestore().collection('matches').doc(match.uid).set(match)
      .then(() => {
        this.state.userDoc.ref.update({ [`currentMatches.${match.uid}`]: Date.now() })
      })
      .then(() => this.setState({ redirectToNewMatch: true, match }))
  }

  leaveMatch = (match) => {
    const { userData } = this.state
    const flatmates = match.flatmates.filter(mate => mate.uid !== userData.uid)
    const currentMatches = _.omit(userData.currentMatches, match.uid)
    Promise.all([
      firebase.firestore().collection('matches').doc(match.uid).update({ flatmates }),
      firebase.firestore().collection('users').doc(userData.uid).update({ currentMatches })
    ]).then(() => {
      this.setState({
        matches: this.state.matches.filter(match_ => match_.uid !== match.uid)
      })
    })
  }

  render() {
    if (this.state.redirectToNewMatch) {
      return <Redirect push to={`/matches/${this.state.match.uid}`} />
    }

    /* const interval = setInterval(() => {
      const { loadingPercent } = this.state
      console.log(loadingPercent)
      this.setState({ loadingPercent: loadingPercent + 1 })
      if (loadingPercent > 1000) {
        clearInterval(interval) // If exceeded 100, clear interval
      }
    }, 1000) */


    return (
      <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
        <Segment loading={this.state.matchesLoading} >
          {this.state.gettingCloudMatched && (
          <Segment loading={this.state.gettingCloudMatched} >
            {/* <Progress color="blue" percent={this.state.loadingPercent} /> */}
            <Link to={`/matches/${fakeMatch.uid}`} >
              <h3>{fakeMatch.uid}</h3>
            </Link>
            <div>{fakeMatch.createdAt}</div>
            <div>{fakeMatch.bestOrigin}</div>
            <div>{`fakeMatch score: ${fakeMatch.flatScore ? fakeMatch.flatScore : ''}`}</div>
            <List horizontal>
              {fakeMatch.flatmates.map(mate => (
                <List.Item key={mate.uid} >
                  <Image avatar src={mate.photoURL} />
                  <List.Content>
                    <List.Header>{mate.displayName}</List.Header>
                    {mate.workplace.split(/[ ,]+/)[0]}
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Segment>
        )}
          {_.sortBy(this.state.matches, 'createdAt').reverse().map(match => (
            <Segment key={match.uid} clearing >
              <Button floated="right" icon="user delete" color="red" onClick={() => this.leaveMatch(match)} />
              <Link to={`/matches/${match.uid}`} >
                <h3>{match.uid}</h3>
              </Link>
              <div>{match.createdAt.toDateString()}</div>
              <div>{match.bestOrigin ? match.bestOrigin : match.location}</div>
              <div>{`Match score: ${match.flatScore ? match.flatScore : ''}`}</div>
              <List horizontal>
                {match.flatmates.map(mate => (
                  <List.Item key={mate.uid} >
                    <Image avatar src={mate.photoURL ? mate.photoURL : personAvatar} />
                    <List.Content>
                      <List.Header>{mate.displayName}</List.Header>
                      {mate.workplace.split(/[ ,]+/)[0]}
                    </List.Content>
                  </List.Item>
              ))}
              </List>
            </Segment>
        ))}
          <Button onClick={this.createNewMatchAndRedirect} >Create new custom match</Button>
        </Segment>
      </Container>
    )
  }
}

export default MatchList
