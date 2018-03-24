import React, { Component } from 'react'
import { Menu, Label, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from './firebase'
// import SignUp from "./SignUp";

class AppHeader extends Component {
  constructor(props) {
    super(props)
    this.unsubscibe = null
    this.state = {
      user: null,
      userData: null,
      newMatch: false,
      userRef: null,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
      if (user) {
        this.unsubscibe = firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot(user => {
            const userData = user.data()
            const newMatch = userData.newMatch
            this.setState({
              userData: user.data(),
              newMatch,
              userRef: user,
            })
          })
      }
    })
  }

  seeNewUsers = () => {
    if (this.state.newMatch) {
      this.state.userRef.update({ newMatch: false })
    }
    this.setState({ newMatch: false })
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

  componentWillUnmount() {
    if (this.unsubscibe) {
      this.unsubscibe()
    }
  }

  render() {
    return (
      <Menu fixed="top" inverted style={{}}>
        <Link to="/">
          <Menu.Item as="div" header>
            Yaps.life
          </Menu.Item>
        </Link>
        <Menu.Menu position="right">
          <Link to="/">
            <Menu.Item as="div">
              <Icon name="magic" />
              How it works
            </Menu.Item>
          </Link>
          <Link to="/profile">
            <Menu.Item as="div">
              <Icon name="user" />
              My profile
            </Menu.Item>
          </Link>
          {this.state.user && (
            <Link to="/match">
              <Menu.Item as="div" onClick={this.seeNewUsers}>
                <Icon name="users" />
                Match
                {this.state.newMatch && (
                  <Label color="red" floating>
                    New
                  </Label>
                )}
              </Menu.Item>
            </Link>
          )}
          {this.state.user && (
            <Link to="/">
              <Menu.Item as="div" onClick={this.logout}>
                <Icon name="log out" />
                Log out
              </Menu.Item>
            </Link>
          )}
          {!this.state.user && (
            <Link to="/create">
              <Menu.Item as="div">
                <Icon name="sign in" />
                Log in
              </Menu.Item>
            </Link>
          )}
          {!this.state.user && (
            <Link to="/create">
              <Menu.Item as="div">
                <Icon name="signup" />
                Sign up
              </Menu.Item>
            </Link>
          )}
        </Menu.Menu>
      </Menu>
    )
  }
}

export default AppHeader
