import React, { Component } from "react";
import { Menu, Container, Modal, Header, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase from "./firebase";
import Login from "./Login";
import SignUp from "./SignUp";

class AppHeader extends Component {
  constructor(props) {
    super(props);
    const user = firebase.auth().currentUser;
    this.state = {
      signedIn: user ? true : false
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ signedIn: true });
      } else {
        this.setState({ signedIn: false });
      }
    });
  }

  logout = () => {
    firebase
      .auth()
      .signOut()
      .then(function() {
        // Sign-out successful.
      })
      .catch(function(error) {
        console.log(error);
        // An error happened.
      });
  };

  render() {
    return (
      <Menu fixed="top" inverted style={{}}>
        <Menu.Item header>
          <Link to="/">Yaps.life</Link>
        </Menu.Item>
        <Menu.Menu position="right">
          <Link to="/matching">
            <Menu.Item>Matching</Menu.Item>
          </Link>
          {this.state.signedIn && (
            <Link to="/">
              <Menu.Item onClick={this.logout}>Log out</Menu.Item>
            </Link>
          )}
          {!this.state.signedIn && (
            <Link to="/login">
              <Menu.Item>Log in</Menu.Item>
            </Link>
          )}
          {!this.state.signedIn && (
            <Link to="/login">
              <Menu.Item>Sign up</Menu.Item>
            </Link>
          )}
        </Menu.Menu>
      </Menu>
    );
  }
}

export default AppHeader;
