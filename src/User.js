import React, { Component } from 'react'
import { FirebaseAuth } from 'react-firebaseui';
import AppHeader from './AppHeader';
import firebase, { auth, provider } from './firebase'
import { Card, Icon, Segment, Container } from 'semantic-ui-react'

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

  uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    // Sets the `signedIn` state property to `true` once signed in.
    callbacks: {
      signInSuccess: () => {
        this.setState({ signedIn: true });
        return false; // Avoid redirects after sign-in.
      }
    }
  };

  login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('login')
        const user = result.user;
        this.setState({
          user
        });
      });
  }

  logout = () => {
    auth.signOut()
      .then(() => {
        console.log('logout')
        this.setState({
          user: null,
        });
      });
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
          this.setState({roommates})
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

    return (
      <div>
        <AppHeader />
        <Container>
          {
            this.state.user ?
              <div>
                <h1>User</h1>
                <p>Welcome! You are now signed-in!</p>
                <h2>Here is your new (potential) flatmate</h2>
                <Segment textAlign='center'>
                  <Card.Group>
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

                  <h1>Your ideal origin is:</h1>
                  <div>Address: {this.state.bestOrigin}</div>
                  {/* {this.state.roommates[0].bestOrigin} */}
                </Segment>
              </div>
              :
              (<div>
                <h1>User</h1>
                <p>Please sign-in:</p>
                <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
              </div>)
          }
        </Container>
      </div>
    )
  }
}

export default User