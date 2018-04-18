import React, { Component } from 'react'
import { Menu, Label, Icon, Responsive, Header, Image } from 'semantic-ui-react'
import { HashLink } from 'react-router-hash-link'
import { slide as BurgerMenu } from 'react-burger-menu'
import { Link } from 'react-router-dom'
import SameGenderLogo from '../assets/logos/SameGenderLogo.png'
import firebase, { auth } from '../firebase'
// import SignUp from "./SignUp";

const styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '0px',
    height: '0px',
    right: '8px',
    top: '25px'
  },
  bmBurgerBars: {
    background: '#ffffff' // '#373a47'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenu: {
    background: '#1b1c1d',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em'
  },
  bmMorphShape: {
    fill: '#1b1c1d'
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
}

class AppHeader extends Component {
  constructor(props) {
    super(props)
    this.unsubscibe = null
    this.state = {
      user: null,
      newMatch: false,
      burgerMenuIsOpen: false,
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

  closeBurgerMenu = () => {
    this.setState({ burgerMenuIsOpen: false })
  }
  seeNewUsers = () => {
    this.closeBurgerMenu()
    if (this.state.newMatch) {
      firebase.firestore().collection('users').doc(this.state.user.uid).update({ newMatch: false })
    }
    this.setState({ newMatch: false })
  }

  logout = () => {
    this.closeBurgerMenu()
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

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  render() {
    const { activeItem, burgerMenuIsOpen } = this.state

    const Logo = () => (
      <Menu.Item>
        <Link to="/">
          <Image src={SameGenderLogo} style={{ filter: 'brightness(0) invert(1)', width: 'auto', height: '2.5em' }} alt="YAPS.life logo" verticalAlign="middle" />
        </Link>
      </Menu.Item>
    )

    const LogoText = () => (
      <Menu.Item
        name="Yaps.life"
        header
        onClick={this.handleItemClick}
      >
        <Link to="/">
          <Header as="h2" color="grey" inverted>
            YAPS.life
          </Header>
        </Link>
      </Menu.Item>
    )


    return (
      <div>
        <Responsive {...Responsive.onlyMobile}>
          <Menu fixed="top" inverted style={{ height: '3em' }}>
            <Logo />
            <LogoText />
            <Menu.Menu position="right">
              <Menu.Item onClick={() => this.setState({ burgerMenuIsOpen: true })} >
                <Icon name="sidebar" />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <BurgerMenu isOpen={burgerMenuIsOpen} right width="80%" styles={styles} >
            <Menu icon="labeled" vertical fluid>
              <Menu.Item onClick={this.closeBurgerMenu} >
                <Icon name="magic" />
                <HashLink smooth to="/#process">
                  How it works
                </HashLink>
              </Menu.Item>
              <Menu.Item onClick={this.closeBurgerMenu}>
                <Icon name="user" />
                <Link to="/profile">
              My profile
                </Link>
              </Menu.Item>
              {this.state.user && (
              <Menu.Item onClick={this.seeNewUsers}>
                <Icon name="users" />
                <Link to="/matches">
                Matches
                  {this.state.newMatch && (
                  <Label color="red" size="mini" >
                    New
                  </Label>
                )}
                </Link>
              </Menu.Item>
          )}
              {this.state.user && (
              <Menu.Item onClick={this.logout}>
                <Icon name="log out" />
                <Link to="/">
                Log out
                </Link>
              </Menu.Item>
          )}
              {!this.state.user && (
              <Menu.Item onClick={this.closeBurgerMenu}>
                <Icon name="sign in" />
                <Link to="/create">
                Log in
                </Link>
              </Menu.Item>
          )}
              {!this.state.user && (
              <Menu.Item onClick={this.closeBurgerMenu}>
                <Icon name="signup" />
                <Link to={{
                    pathname: '/create',
                    state: { signUp: true }
                  }}
                >
                Sign up
                </Link>
              </Menu.Item>
          )}

            </Menu>
          </BurgerMenu>
        </Responsive>
        <Responsive minWidth={Responsive.onlyTablet.minWidth}>
          <Menu fixed="top" inverted style={{ height: '3em' }}>
            <Logo />
            <LogoText />
            <Menu.Menu position="right">
              <Menu.Item name="process" onClick={this.handleItemClick} >
                <HashLink smooth to="/#process">
                  <Icon name="magic" />
              How it works
                </HashLink>
              </Menu.Item>
              <Menu.Item name="profile" onClick={this.handleItemClick} >
                <Link to="/profile">
                  <Icon name="user" />
              My profile
                </Link>
              </Menu.Item>
              {this.state.user && (
              <Menu.Item onClick={this.seeNewUsers}>
                <Link to="/matches">
                  <Icon name="users" />
                Matches
                  {this.state.newMatch && (
                  <Label color="red" size="mini" >
                    New
                  </Label>
                )}
                </Link>
              </Menu.Item>
          )}
              {this.state.user && (
              <Menu.Item name="logout" onClick={this.logout}>
                <Link to="/">
                  <Icon name="log out" />
                Log out
                </Link>
              </Menu.Item>
          )}
              {!this.state.user && (
              <Menu.Item name="signIn" onClick={this.handleItemClick}>
                <Link to="/create">
                  <Icon name="sign in" />
                Log in
                </Link>
              </Menu.Item>
          )}
              {!this.state.user && (
              <Menu.Item name="signUp" onClick={this.handleItemClick}>
                <Link to={{
                    pathname: '/create',
                    state: { signUp: true }
                  }}
                >
                  <Icon name="signup" />
                Sign up
                </Link>
              </Menu.Item>
          )}
            </Menu.Menu>
          </Menu>
        </Responsive>
      </div>

    )
  }
}

export default AppHeader
