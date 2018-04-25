import React, { Component } from 'react'
import { Menu, Label, Icon, Responsive, Header, Image } from 'semantic-ui-react'
import { HashLink } from 'react-router-hash-link'
import { slide as BurgerMenu } from 'react-burger-menu'
import { Link } from 'react-router-dom'
import SameGenderLogo from '../assets/logos/SameGenderLogo.png'
import { auth, firestore } from '../firebase'
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
    this.state = {
      burgerMenuIsOpen: false,
      activeItem: '',
    }
  }
  /*
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
              const { newMatches } = doc.data()
              this.setState({
                newMatches
              })
            } catch (error) {
              console.log(error)
            }
          })
      }
    })
  } */

  closeBurgerMenu = () => {
    this.setState({ burgerMenuIsOpen: false })
  }
  seeNewUsers = (newMatches) => {
    this.closeBurgerMenu()
    this.handleItemClick(null, { name: 'matches' })
    if (newMatches) {
      firestore.collection('users').doc(this.props.user.uid).update({ newMatches: false })
    }
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
    const { burgerMenuIsOpen, activeItem } = this.state
    const { user } = this.props
    const { newMatches } = this.props

    const Logo = () => (
      <Menu.Item as="div">
        <Link to="/">
          <Image src={SameGenderLogo} style={{ filter: 'brightness(0) invert(1)', width: 'auto', height: '2.5em' }} alt="YAPS.life logo" verticalAlign="middle" />
        </Link>
      </Menu.Item>
    )

    const LogoText = () => (
      <Menu.Item
        as="div"
        name="YAPS.life"
        active={activeItem === 'YAPS.life'}
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
              <Menu.Item as="div" onClick={() => this.setState({ burgerMenuIsOpen: true })} >
                <Icon name="sidebar" />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <BurgerMenu isOpen={burgerMenuIsOpen} right width="80%" styles={styles} >
            <Menu icon="labeled" vertical fluid>
              <Menu.Item as="div" onClick={this.closeBurgerMenu} >
                <Icon name="magic" />
                <HashLink smooth to="/#process">
                  How it works
                </HashLink>
              </Menu.Item>
              <Menu.Item as="div" onClick={this.closeBurgerMenu}>
                <Icon name="user" />
                <Link to="/profile">
              My profile
                </Link>
              </Menu.Item>
              {user && (
              <Menu.Item as="div" onClick={() => this.seeNewUsers(newMatches)}>
                <Icon name="users" />
                <Link to="/matches">
                Matches
                  {newMatches && (
                  <Label color="red" size="mini" >
                    New
                  </Label>
                )}
                </Link>
              </Menu.Item>
          )}
              <Menu.Item as="div" onClick={this.closeBurgerMenu} >
                <Icon name="home" />
                <Link to="/landlord-view">
              Upload listing
                </Link>
              </Menu.Item>
              {user && (
              <Menu.Item as="div" onClick={this.logout}>
                <Icon name="log out" />
                <Link to="/">
                Log out
                </Link>
              </Menu.Item>
          )}
              {!user && (
              <Menu.Item as="div" onClick={this.closeBurgerMenu}>
                <Icon name="sign in" />
                <Link to="/create">
                Log in
                </Link>
              </Menu.Item>
          )}
              {!user && (
              <Menu.Item as="div" onClick={this.closeBurgerMenu}>
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
              <Menu.Item as="div" name="process" onClick={this.handleItemClick} >
                <HashLink smooth to="/#process">
                  <Icon name="magic" />
              How it works
                </HashLink>
              </Menu.Item>
              <Menu.Item as="div" active={activeItem === 'profile'} name="profile" onClick={this.handleItemClick} >
                <Link to="/profile">
                  <Icon name="user" />
              My profile
                </Link>
              </Menu.Item>

              <Menu.Item as="div" active={activeItem === 'matches'} name="matches" onClick={() => this.seeNewUsers(newMatches)}>
                <Link to="/matches">
                  <Icon name="users" />
                Matches
                  {newMatches && (
                  <Label color="red" size="mini" >
                    New
                  </Label>
                )}
                </Link>
              </Menu.Item>
              <Menu.Item as="div" active={activeItem === 'landlord-view'} name="landlord-view" onClick={this.handleItemClick} >
                <Link to="/landlord-view">
                  <Icon name="home" />
              Upload listing
                </Link>
              </Menu.Item>
              {user && (
              <Menu.Item as="div" name="logout" onClick={this.logout}>
                <Link to="/">
                  <Icon name="log out" />
                Log out
                </Link>
              </Menu.Item>
          )}
              {!user && (
              <Menu.Item as="div" name="signIn" onClick={this.handleItemClick}>
                <Link to="/create">
                  <Icon name="sign in" />
                Log in
                </Link>
              </Menu.Item>
          )}
              {!user && (
              <Menu.Item as="div" name="signUp" onClick={this.handleItemClick}>
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
