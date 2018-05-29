import React, { Component } from 'react'
import { Loader, Image, Dimmer, Button, Container, Segment, List, Progress, Header, Popup, Message } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import _ from 'underscore'
import axios from 'axios'
import { auth, firestore } from '../firebase'
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
  personalityAlignment: 100,
  location: 'Oslo',
  bestOrigin: '',
  custom: true,
  createdAt: ''
}

const cloudMatchText = {
  0: '',
  10: 'Uploading you to the cloud. Prepare to get matched ;)',
  25: 'Matching underway. Stay tuned.',
  45: '',
  70: 'Wrapping up, almost done now.',
  90: 'Just a few seconds more.'
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
      matchesLoading: true,
      gettingCloudMatched: 0,
      redirectToSignIn: false,
      profileNotFinished: false,
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => { // Check if user is logged in
      this.setState({ user })
      if (user) { // If logged in
        this.unsubscribe = firestore.collection('users').doc(user.uid).onSnapshot((doc) => { // Subscribe to datastream for user object from firestore
          const userData = doc.data()
          const { currentMatches, gettingCloudMatched } = userData
          const matches = currentMatches || {}

          this.setState({ gettingCloudMatched }) // Signal the user that something is happening

          Promise.all(Object.keys(matches).map(matchId => firestore.collection('matches').doc(matchId).get())) // Get match documents
            .then(results => this.setState({ // Update state with the matches
              matchesLoading: false,
              userData,
              matches: results.map(res => res.data())
            }))
        })
      } else { // If not signed in, redirect to log in page
        this.setState({
          redirectToSignIn: true
        })
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }


  getMatched = (e) => {
    e.preventDefault()
    console.log('about to match')
    this.setState({ gettingCloudMatched: 10 })
    axios
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getDemoMatched', { userUid: this.state.user.uid })
  }

  readyToMatch() {
    const { workplace, workplaceLatLng, university } = this.state.userData
    if (!workplace || !university || !workplaceLatLng) {
      this.setState({ profileNotFinished: true })
      return false
    }
    return true
  }

  createNewCustomMatch = (e) => {
    if (!this.readyToMatch()) return
    e.preventDefault()
    this.setState({ gettingCloudMatched: 10 })
    console.log('about to match')
    axios
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getSoloMatched', { userUid: this.state.user.uid })
  }

  leaveMatch = (match) => {
    const { userData } = this.state
    const flatmates = match.flatmates.filter(mate => mate.uid !== userData.uid)
    const currentMatches = _.omit(userData.currentMatches, match.uid)
    const matchRef = firestore.collection('matches').doc(match.uid)
    Promise.all([
      matchRef.update({ flatmates }),
      matchRef.collection('messages').add({
        text: `${userData.displayName} left the match`,
        dateTime: new Date(),
        from: {
          uid: userData.uid,
          displayName: userData.displayName,
          photoURL: userData.photoURL ? userData.photoURL : personAvatar,
        },
      }),
      firestore.collection('users').doc(userData.uid).update({ currentMatches })
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

    if (this.state.redirectToSignIn) {
      return (
        <Redirect
          push
          to={{
          pathname: '/create',
          state: { redirectToProfile: true }
        }}
        />
      )
    }

    console.log(this.state.user)
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
        <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
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
                content="Create your own match, do a demo match or wait for the system to match you with AI. You'll get an email when it does."
              />
          )
            }
            {this.state.gettingCloudMatched > 0 && (
              <Progress active color="blue" percent={this.state.gettingCloudMatched} />
            )}
            {this.state.gettingCloudMatched > 0 && (
              <Segment >
                <Dimmer active inverted>
                  <Loader>{cloudMatchText[this.state.gettingCloudMatched]}</Loader>
                </Dimmer>
                <Link to={`/matches/${fakeMatch.uid}`} >
                  <h3>{fakeMatch.uid}</h3>
                </Link>
                <div>{fakeMatch.createdAt}</div>
                <div>{fakeMatch.bestOrigin}</div>
                <div>{`Match score: ${fakeMatch.personalityAlignment ? fakeMatch.personalityAlignment : ''}`}</div>
                <List horizontal>
                  {fakeMatch.flatmates.map(mate => (
                    <List.Item key={mate.uid} >
                      <Image avatar src={mate.photoURL} />
                      <List.Content>
                        <List.Header>{mate.displayName}</List.Header>
                        {mate.workplace ? mate.workplace.split(/[ ,]+/)[0] : ''}
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
                  <h3>{match.title ? match.title : 'Match Title'}</h3>
                </Link>
                <div>{match.createdAt.toDateString()}</div>
                <div>{match.bestOrigin ? match.bestOrigin : match.location}</div>
                <div>
                  <div>{`Personality alignment: ${match.personalityAlignment ? match.personalityAlignment : ''}`}</div>
                  <div>{`Property alignment: ${match.propertyAlignment ? match.propertyAlignment : ''}`}</div>
                </div>
                <List horizontal>
                  {match.flatmates.map(mate => (
                    <List.Item key={mate.uid} >
                      <Image avatar src={mate.photoURL ? mate.photoURL : personAvatar} />
                      <List.Content>
                        <List.Header>{mate.displayName}</List.Header>
                        {mate.workplace ? mate.workplace.split(/[ ,]+/)[0] : ''}
                      </List.Content>
                    </List.Item>
              ))}
                </List>
              </Segment>
            ))}
            <div>
              <Popup
                trigger={
                  <Button onClick={this.createNewCustomMatch} >Create new solo match to find single rooms or add friends</Button>}
                content="Create your own match and invite your friends"
              />
              <Popup
                trigger={<Button onClick={this.getMatched} >Get matched by AI(demo)</Button>}
                content="Do a test match with test users to see what the process looks like"
              />
            </div>
            {this.state.profileNotFinished &&
            <Message error >
              You need to fill out your profile before you can get matched
            </Message>
            }
          </Segment>
        </Container>
      </div>
    )
  }
}

export default MatchList
