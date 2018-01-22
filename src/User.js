import React, { Component } from 'react'
import { FirebaseAuth } from 'react-firebaseui';
import AppHeader from './AppHeader';
import firebase from './firebase'
import { Card, Icon } from 'semantic-ui-react'

class User extends Component {

  constructor(props) {
    super(props);

    const user = firebase.auth().currentUser

    this.state = {
      signedIn: user ? true : false,
      user: user,
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


  render() {

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
              <h2>This is you:</h2>
              <Card.Group>
                <Card
                  image={this.state.user.photoURL}
                  header={this.state.user.displayName}
                  meta='Digital nomad'
                  description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                  extra={extra}
                />
                <Card
                  image={this.state.user.photoURL}
                  header={this.state.user.displayName}
                  meta='Digital nomad'
                  description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                  extra={extra}
                />
                <Card
                  image={this.state.user.photoURL}
                  header={this.state.user.displayName}
                  meta='Digital nomad'
                  description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                  extra={extra}
                />
                <Card
                  image={this.state.user.photoURL}
                  header={this.state.user.displayName}
                  meta='Digital nomad'
                  description='Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat.'
                  extra={extra}
                />
              </Card.Group>

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