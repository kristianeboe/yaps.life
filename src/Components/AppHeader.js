import React, { Component } from 'react'
import { Menu, Label, Icon } from 'semantic-ui-react'
import { HashLink } from 'react-router-hash-link'
import { Link } from 'react-router-dom'
import firebase, { auth } from '../firebase'
// import SignUp from "./SignUp";

class AppHeader extends Component {
  constructor(props) {
    super(props)
    this.unsubscibe = null
    this.state = {
      user: null,
      newMatch: false,
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
      if (user) {
        this.unsubscibe = firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot((doc) => {
            try {
              const { newMatch } = doc.data()
              this.setState({
                newMatch
              })
            } catch (error) {
              console.log(error)
            }
          })
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscibe) {
      this.unsubscibe()
    }
  }
  seeNewUsers = () => {
    if (this.state.newMatch) {
      firebase.firestore().collection('users').doc(this.state.user.uid).update({ newMatch: false })
    }
    this.setState({ newMatch: false })
  }

  logout = () => {
    auth
      .signOut()
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        console.log(error)
        // An error happened.
      })
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
          <HashLink smooth to="/#process">
            <Menu.Item as="div">
              <Icon name="magic" />
              How it works
            </Menu.Item>
          </HashLink>
          <Link to="/profile">
            <Menu.Item as="div">
              <Icon name="user" />
              My profile
            </Menu.Item>
          </Link>
          {this.state.user && (
            <Link to="/matches">
              <Menu.Item as="div" onClick={this.seeNewUsers}>
                <Icon name="users" />
                Matches
                {this.state.newMatch && (
                  <Label color="red" size="tiny" >
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
