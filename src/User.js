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
        firebase.firestore().collection("users").doc(user.uid).get().then((doc) => {
          const userData = doc.data()
          this.setState({
            userData,
            bestOrigin: userData.match.bestOrigin,
            signedIn: true,
          })
          return userData
        }).then((userData) => {
          let userPromises = []
          console.log(userData.match.roommates)
          for (let roommate of userData.match.roommates) {
            console.log(roommate)
            userPromises.push(firebase.firestore().collection("users").doc(roommate).get().then(doc => doc.data()))
          }
          userPromises.push(firebase.firestore().collection("users").doc(userData.match.roommates[0]).get().then(doc => doc.data()))

          console.log('userPromises', userPromises)
          Promise.all(userPromises).then((results) => {
            this.setState({
              roommates: results
            })
          })

        })
      } else {
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
            this.state.signedIn ?
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
                    {this.state.roommates &&
                      this.state.roommates.map(roommate => (
                        <Card
                          image={roommate.photoURL}
                          header={roommate.displayName}
                          meta={roommate.workplace}
                          // description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                          // extra={extra}
                        />
                      ))
                    }
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