import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from './firebase'
// import SignUp from "./SignUp";

class AppHeader extends Component {
  constructor(props) {
    super(props)
    const user = firebase.auth().currentUser
    this.state = {
      signedIn: user ? true : false,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ signedIn: true })
      } else {
        this.setState({ signedIn: false })
      }
    })
  }

  logout = () => {
    firebase
      .auth()
      .signOut()
      .then(function() {
        // Sign-out successful.
      })
      .catch(function(error) {
        console.log(error)
        // An error happened.
      })
  }

  render() {
    return (
      <Menu fixed="top" inverted style={{}}>
        <Link to="/">
          <Menu.Item as='div' header>Yaps.life</Menu.Item>
        </Link>
        <Menu.Menu position="right">
          <Link to="/matching">
            <Menu.Item as='div'>Matching</Menu.Item>
          </Link>
          {this.state.signedIn && (
            <Link to="/user">
              <Menu.Item as='div'>Results</Menu.Item>
            </Link>
          )}
          {this.state.signedIn && (
            <Link to="/">
              <Menu.Item as='div' onClick={this.logout}>Log out</Menu.Item>
            </Link>
          )}
          {!this.state.signedIn && (
            <Link to="/login">
              <Menu.Item as='div'>Log in</Menu.Item>
            </Link>
          )}
          {!this.state.signedIn && (
            <Link to="/login">
              <Menu.Item as='div'>Sign up</Menu.Item>
            </Link>
          )}
        </Menu.Menu>
      </Menu>
    )
  }
}

export default AppHeader
