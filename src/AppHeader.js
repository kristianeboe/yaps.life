import React, { Component } from 'react'
import {
  Menu,
  Container,
  Modal,
  Header,
  Button,
} from 'semantic-ui-react'
import {
  Link
} from 'react-router-dom'
import firebase from './firebase'
import Login from './Login'


class AppHeader extends Component {

  constructor(props) {
    super(props);
    const user = firebase.auth().currentUser
    this.state = {
      signedIn: user ? true : false,
    };
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ signedIn: true })

      } else {
        this.setState({ signedIn: false })
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
    
    const ModalModalExample = () => (
      <Login />
    )

    return (
      <Menu fixed='top' inverted style={{}}>
        <Container>
          <Menu.Item header>
            <Link to="/">Yaps.life</Link>
          </Menu.Item>
          <Menu.Item><Link to="/">Home</Link></Menu.Item>
          <Menu.Item><Link to="/user">User</Link></Menu.Item>
          <Menu.Item><Link to="/register">Register</Link></Menu.Item>
          <Menu.Menu position='right'>
            {this.state.signedIn ?
              <Menu.Item onClick={this.logout} ><Link to="/">Log out</Link></Menu.Item>
              :
              <Menu.Item ><Link to="/user">Log in</Link></Menu.Item>
            }
            <ModalModalExample />
          </Menu.Menu>
        </Container>
      </Menu>)
  }
}

export default AppHeader