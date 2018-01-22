import React, { Component } from 'react'
import {
  Button,
  Menu,
  Icon,
  Sidebar,
  Segment,
  Header,
  Image,
  Dropdown,
  Container
} from 'semantic-ui-react'
import {
  Link
} from 'react-router-dom'
import firebase from './firebase'


class AppHeader extends Component {

  constructor(props) {
    super(props);
    // const provider = new firebase.auth.GoogleAuthProvider();
    const user = firebase.auth().currentUser
    console.log("App header")
    this.state = {
      user: user,
    };
  }

  logout = () => {
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
    }).catch(function(error) {
      console.log(error)
      // An error happened.
    });
  }

  render() {
    return (
      <Menu fixed='top' inverted>
        <Container>
          <Menu.Item as='a' header>
            Yaps.life
          </Menu.Item>
          <Menu.Item><Link to="/">Home</Link></Menu.Item>
          <Menu.Item><Link to="/user">User</Link></Menu.Item>
          {this.props.signedIn ?
            <Menu.Item onClick={this.logout} ><Link to="/">Sign out</Link></Menu.Item>
            :
            <Menu.Item ><Link to="/user">Sign in</Link></Menu.Item>
          }
        </Container>
      </Menu>)
  }
}

export default AppHeader