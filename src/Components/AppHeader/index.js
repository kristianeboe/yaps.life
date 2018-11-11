import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { Menu, Responsive, Header, Image } from 'semantic-ui-react'
import { action as toggleMenu } from 'redux-burger-menu'
import SameGenderLogo from '../../assets/logos/SameGenderLogo.png'
import { auth, firestore } from '../../firebase'
import { getUser, getActiveLink, isBurgerMenuOpen } from '../../selectors'
import { openBurgerMenu, closeBurgerMenu, setActiveLink, logOut } from '../../actions'
import AppHeader from './Appheader'
// import SignUp from "./SignUp";

/* seeNewUsers = (newMatches) => {
  this.closeBurgerMenu()
  setActiveLink('matches')
  if (newMatches) {
    firestore.collection('users').doc(this.props.user.uid).update({ newMatches: false })
  }
} */

export default withRouter(connect(
  state => ({
    user: getUser(state),
    activeLink: getActiveLink(state),
    burgerMenuIsOpen: isBurgerMenuOpen(state)
  }),
  dispatch => ({
    logOut: () => dispatch(logOut()),
    setActiveLink: link => dispatch(setActiveLink(link)),
    openBurgerMenu: () => dispatch(toggleMenu(true)),
    closeBurgerMenu: () => dispatch(toggleMenu(false))
  })
)(AppHeader))
