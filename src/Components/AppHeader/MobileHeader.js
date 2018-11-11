import React from 'react'
import { Menu, Label, Icon } from 'semantic-ui-react'
import { HashLink } from 'react-router-hash-link'
import BurgerMenu from './BurgerMenu'
import { Link } from 'react-router-dom'
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


const MobileHeader = ({
  Logo, LogoText, openBurgerMenu, closeBurgerMenu, burgerMenuIsOpen, user, logOut
}) => (
  <React.Fragment>
    <Menu fixed="top" inverted style={{ height: '3em' }}>
      <Logo />
      <LogoText />
      <Menu.Menu position="right">
        <Menu.Item as="div" onClick={openBurgerMenu} >
          <Icon name="sidebar" />
        </Menu.Item>
      </Menu.Menu>
    </Menu>
    <BurgerMenu isOpen={burgerMenuIsOpen} right width="80%" styles={styles} >
      <Menu icon="labeled" vertical fluid>
        <Menu.Item as="div" onClick={closeBurgerMenu} >
          <Icon name="magic" />
          <HashLink smooth to="/#process">
                  How it works
          </HashLink>
        </Menu.Item>
        <Menu.Item as="div" onClick={closeBurgerMenu}>
          <Icon name="user" />
          <Link to="/profile">
              My profile
          </Link>
        </Menu.Item>
        {user.uid && (
          /* onClick={() => this.seeNewUsers(newMatches)} */
        <Menu.Item as="div" >
          <Icon name="users" />
          <Link to="/matches">
                Matches
            {/* {newMatches && (
            <Label color="red" size="mini" >
                    New
            </Label>
                )} */}
          </Link>
        </Menu.Item>
          )}
        <Menu.Item as="div" onClick={closeBurgerMenu} >
          <Icon name="home" />
          <Link to="/landlord-view">
              Upload listing
          </Link>
        </Menu.Item>
        {user.uid && (
        <Menu.Item as="div" onClick={logOut}>
          <Icon name="log out" />
          <Link to="/">
                Log out
          </Link>
        </Menu.Item>
          )}
        {!user.uid && (
        <Menu.Item as="div" onClick={closeBurgerMenu}>
          <Icon name="sign in" />
          <Link to="/create">
                Log in
          </Link>
        </Menu.Item>
          )}
        {!user.uid && (
        <Menu.Item as="div" onClick={closeBurgerMenu}>
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
  </React.Fragment>
)

export default MobileHeader
