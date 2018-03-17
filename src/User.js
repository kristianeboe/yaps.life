import React, { Component } from 'react'
import { FirebaseAuth } from 'react-firebaseui';
import AppHeader from './AppHeader';
import firebase, { auth } from './firebase'
import { Responsive, Card, Icon, Segment, Container } from 'semantic-ui-react'
import ChatRoom from './ChatRoom'

class User extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      userData: null,
      roommates: [],
      bestOrigin: '',
    };
  }


  componentDidMount() {

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user })

        firebase.firestore().collection("users").doc(user.uid).get().then((doc) => {
          const userData = doc.data()
          console.log(userData)
          this.setState({
            userData,
            bestOrigin: 'Oslo',
          })
          return userData.match.roommates
        }).then((roommates) => {
          return Promise.all(roommates.map((roommate) => firebase.firestore().collection("users").doc(roommate.userId).get()))
        }).then((results) => {
          console.log(results)
          const roommates = []
          results.map((doc) => {
            const roommate = doc.data()
            roommates.push(roommate)
          })
          console.log(roommates)
          console.log(this.state)
          this.setState({ roommates })
          console.log(this.state)
        }).catch(error => console.log(error))
      } else {
        this.setState({ user: null })
        console.log('did mount auth state log out')
      }
    });
  }

  componentWillUnmount() {

  }

  render() {

    console.log(this.state)

    const extra = (
      <a>
        <Icon name='user' />
        16 Friends
      </a>
    )

    // console.log(this.state.roommates[0])
    // console.log(this.state.roommates[0].photoURL)
    console.log(Responsive.onlyMobile)
    console.log({ ...Responsive.onlyMobile })
    console.log({ ...Responsive.onlyComputer })
    console.log(window)
    const cardsPrRow = window.innerWidth < 400 ? 2 : 4

    return (
      <div>
        <AppHeader />
        <Container style={{ paddingTop: '5em', paddingBottom: '3em' }} >
          {
            this.state.user &&
            <div>
              <Segment>
                <h2>Here are your new (potential) flatmates</h2>
                <Card.Group itemsPerRow={cardsPrRow}>
                  {this.state.userData && (
                    <Card
                      image={this.state.userData.photoURL}
                      header={this.state.userData.displayName}
                      meta={this.state.userData.workplace}
                    // description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                    // extra={extra}
                    />
                  )}
                  {this.state.roommates.map(roommate => (
                    <Card
                      image={roommate.photoURL}
                      header={roommate.displayName}
                      meta={roommate.workplace}
                    // description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                    // extra={extra}
                    />
                  ))}
                </Card.Group>

              </Segment>
              <Segment textAlign='center'>
                <h1>Your ideal origin is:</h1>
                <div>Address: {this.state.bestOrigin}</div>
              </Segment>
              <ChatRoom />
            </div>
          }
        </Container>
      </div>
    )
  }
}

export default User