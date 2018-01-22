import React, { Component } from 'react'
import { FirebaseAuth } from 'react-firebaseui';
import AppHeader from './AppHeader';
import firebase from './firebase'

class User extends Component {

  constructor(props) {
    super(props);

    const user = firebase.auth().currentUser

    this.state = {
      signedIn: user ? true : false,
      user: null,
    };
  }

  uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'redirect',
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

    return (
      <div>
        <AppHeader />
        {
          this.state.signedIn ?
            <div>
              <h1>User</h1>
              <p>Welcome! You are now signed-in!</p>
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