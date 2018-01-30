import React, { Component } from 'react'
import { FirebaseAuth } from 'react-firebaseui';
import AppHeader from './AppHeader';
import firebase from './firebase'
import { Card, Icon, Segment } from 'semantic-ui-react'

class User extends Component {

  constructor(props) {
    super(props);

    const user = firebase.auth().currentUser

    this.state = {
      signedIn: user ? true : false,
      user: user,
      roomMates: []
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
  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ signedIn: true })

      } else {
        this.setState({ signedIn: false })
      }
    });
  }
  
  componentDidMount() {
    // me id 6wAY2l99509C7YLhIJdP
    // yaps id dLCpM1BkJCzeV9MNxWj0



    firebase.firestore().collection('users').doc('dLCpM1BkJCzeV9MNxWj0').get().then((doc) => {
      this.setState({
        roomMates: this.state.roomMates.concat(doc.data())
      })
      // getMe
      // get bestMatchId
      // get roommate
      // populate state with [] of roommates
    })

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
                  <Card
                    image={this.state.user.photoURL}
                    header={this.state.user.displayName}
                    meta='Digital nomad'
                    description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                    extra={extra}
                  />
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