import React, { Component } from 'react'
import {
  Menu,
  Container
} from 'semantic-ui-react'
import {
  Link
} from 'react-router-dom'
import firebase from './firebase'


class AppHeader extends Component {

  constructor(props) {
    super(props);
    const user = firebase.auth().currentUser
    this.state = {
      signedIn: user? true : false,
    };
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({signedIn: true})

      } else {
        this.setState({signedIn: false})
      }
    });
  }

  logout = () => {
    firebase.auth().signOut().then(function () {
      // Sign-out successful.
    }).catch(function (error) {
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
          {this.state.signedIn ?
            <Menu.Item onClick={this.logout} ><Link to="/">Sign out</Link></Menu.Item>
            :
            <Menu.Item ><Link to="/user">Sign in</Link></Menu.Item>
          }
        </Container>
      </Menu>)
  }
}

export default AppHeader