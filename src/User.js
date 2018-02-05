import React, { Component } from 'react'
import { FirebaseAuth } from 'react-firebaseui';
import AppHeader from './AppHeader';
import firebase, {auth, provider} from './firebase'
import { Card, Icon, Segment } from 'semantic-ui-react'

class User extends Component {

  constructor(props) {
    super(props);

    this.unsubscribe = null

    this.state = {
      user: null,
      userData: null,
      roomMates: [],
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
        firebase.firestore().collection("users").doc(user.uid).get().then((userData) => {
          this.setState({userData: userData})
        })

        console.log('did mount auth state log in')
        this.unsubscribe = firebase.firestore().collection("users").doc(user.uid).collection('roommates').onSnapshot((snapshot) => {
          const roommates = []
          snapshot.forEach((doc => {
            const { name, platform, description } = doc.data()
            roommates.push({
              key: doc.id,
              doc,
              name,
              platform,
              description,
            })
          }))
          this.setState({
            user,
            roommates,
            loading: false,
          })
        })
      } else {
        console.log('did mount auth state log out')
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {

    console.log(this.state)

    const extra = (
      <a>
        <Icon name='user' />
        16 Friends
      </a>
    )


    return (
      <div>
        <AppHeader />
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
                      meta='Digital nomad'
                      description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                      extra={extra}
                    />
                  )}
                  {this.state.roomMates &&
                    this.state.roomMates.map(roomMate => (
                      <Card
                        image={roomMate.photo_url}
                        header={roomMate.displayName}
                        meta='Digital nomad'
                        description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                        extra={extra}
                      />
                    ))
                  }
                </Card.Group>

                <h1>Your ideal origin is:</h1>
                <div>Address: aaaa</div>
                {/* {this.state.roomMates[0].bestOrigin} */}
              </Segment>
            </div>
            :
            (<div>
              <h1>User</h1>
              <p>Please sign-in:</p>
              <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
            </div>)
        }
      </div>
    )
  }
}

export default User