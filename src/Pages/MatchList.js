import React, { Component } from 'react'
import { Loader, Image, Dimmer, Button, Container, Segment, List, Progress, Header, Popup, Message } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import uuid from 'uuid'
import _ from 'underscore'
import axios from 'axios'
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
      user: null,
      matches: [],
      redirectToNewMatch: false,
      userData: null,
      userDoc: null,
      matchesLoading: true,
      gettingCloudMatched: false,
      loadingPercent: 0,
      loadingText: '',
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
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

  getMatched = (e) => {
    e.preventDefault()
    console.log('about to match')
    firebase.firestore().collection('users').doc(this.state.user.uid).update({ gettingCloudMatched: true })
    this.setState({ gettingCloudMatched: true, loadingPercent: 25, loadingText: 'Uploading you to the cloud. Prepare to get matched ;)' })
    setTimeout(() => this.setState({ loadingPercent: 50, loadingText: 'Wrapping up, almost done now.' }), 10000)
    axios
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getMatchedByClusterOnSave', { userUid: this.state.user.uid })
      .then((response) => {
        this.setState({ loadingPercent: 75, loadingText: 'Matching underway. Stay tuned.' })
        console.log(response)
        setTimeout(() => this.setState({ loadingPercent: 90, loadingText: 'Wrapping up, almost done now.' }), 10000)
      })
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
    const matchRef = firebase.firestore().collection('matches').doc(match.uid)
    Promise.all([
      matchRef.update({ flatmates }),
      matchRef.collection('messages').add({
        text: `${userData.displayName} left the match`,
        dateTime: Date.now(),
        from: {
          uid: userData.uid,
          displayName: userData.displayName,
          photoURL: userData.photoURL ? userData.photoURL : personAvatar,
        },
      }),
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

    // loading={this.state.gettingCloudMatched}

    return (
      <div style={{
        backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
          // backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
          backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
          backgroundSize: 'cover',
          boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
          height: '-webkit-fill-available'
          }}
      >
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }}>
          <Segment loading={this.state.matchesLoading} >
            <Header as="h3" dividing >
                Match list
              <Header.Subheader>
                Here is a list of all your matches. Click a title to get more information and start exploring options with your new flatmates.
              </Header.Subheader>
            </Header>
            {this.state.matches.length === 0 &&
            (
              <Message
                icon="users"
                header="You have no matches yet"
                content="Create your own match or get matched by AI by clicking the buttons below"
              />
          )
            }
            {this.state.gettingCloudMatched && (
              <Progress active color="blue" percent={this.state.loadingPercent} />
            )}
            {this.state.gettingCloudMatched && (
            <Segment >
              {this.state.gettingCloudMatched && (
                <Dimmer active inverted>
                  <Loader>{this.state.loadingText}</Loader>
                </Dimmer>
              )}
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
                  <h3>Match title</h3>
                </Link>
                <div>{match.createdAt.toDateString()}</div>
                <div>{match.bestOrigin ? match.bestOrigin : match.location}</div>
                <div>
                  <div>{`Personality alignment: ${match.flatScore ? match.flatScore : ''}`}</div>
                  <div>{`Property alignment: ${match.propertyAlignment ? match.propertyAlignment : ''}`}</div>
                </div>
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
            <div>
              <Button onClick={this.createNewMatchAndRedirect} >Create new custom match</Button>
              <Popup
                trigger={<Button onClick={this.getMatched} >Get matched by AI(demo)</Button>}
                content="Do a test match with test users to see what the process looks like"
              />
              <Button>Get matched by AI</Button>
            </div>
          </Segment>
        </Container>
      </div>
    )
  }
}

export default MatchList
