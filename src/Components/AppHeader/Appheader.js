import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { Menu, Responsive, Header, Image } from 'semantic-ui-react'
import SameGenderLogo from '../../assets/logos/SameGenderLogo.png'
import { auth, firestore } from '../../firebase'
import { getUser, getActiveLink, isBurgerMenuOpen } from '../../selectors'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'
// import SignUp from "./SignUp";

/* seeNewUsers = (newMatches) => {
  this.closeBurgerMenu()
  setActiveLink('matches')
  if (newMatches) {
    firestore.collection('users').doc(this.props.user.uid).update({ newMatches: false })
  }
} */
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
    // active={activeLink === 'YAPS.life'}
    header
    // onClick={() => setActiveLink('YAPS.life')}
  >
    <Link to="/">
      <Header as="h2" color="grey" inverted>
        YAPS.life
      </Header>
    </Link>
  </Menu.Item>
)
const LogoTextLong = () => (
  <Menu.Item >
    <i>Young Aspiring Professionals</i>
  </Menu.Item>
)

const AppHeader = ({
  user, activeLink, burgerMenuIsOpen, logOut, openBurgerMenu, closeBurgerMenu, setActiveLink
}) => (
  <React.Fragment>
    <Responsive {...Responsive.onlyMobile}>
      <MobileHeader
        user={user}
        setActiveLink={setActiveLink}
        Logo={Logo}
        LogoText={LogoText}
        openBurgerMenu={openBurgerMenu}
        closeBurgerMenu={closeBurgerMenu}
        burgerMenuIsOpen={burgerMenuIsOpen}
        logOut={logOut}
      />
    </Responsive>
    <Responsive minWidth={Responsive.onlyTablet.minWidth}>
      <DesktopHeader
        user={user}
        setActiveLink={setActiveLink}
        Logo={Logo}
        LogoText={LogoText}
        LogoTextLong={LogoTextLong}
        activeLink={activeLink}
        logOut={logOut}
      />
    </Responsive>
  </React.Fragment>
)
export default AppHeader
