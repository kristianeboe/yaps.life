import React from 'react'
import { Menu, Label, Icon, Image, Dropdown } from 'semantic-ui-react'
import { HashLink } from 'react-router-hash-link'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'


const DesktopHeader = ({
  user, Logo, LogoText, LogoTextLong, activeLink, logOut
}) => (
  <Menu fixed="top" inverted style={{ height: '3em' }}>
    <Logo />
    <LogoText />
    <LogoTextLong />
    <Menu.Menu position="right">
      <Menu.Item as="div" name="process" onClick={this.handleItemClick} >
        <HashLink smooth to="/#process">
          <Icon name="magic" />
              How it works
        </HashLink>
      </Menu.Item>
      <Menu.Item as="div" active={activeLink === 'profile'} name="profile" onClick={this.handleItemClick} >
        <Link to="/profile">
          <Icon name="user" />
              My profile
        </Link>
      </Menu.Item>
      {/* onClick={() => this.seeNewUsers(newMatches)} */}
      <Menu.Item as="div" active={activeLink === 'matches'} name="matches" >
        <Link to="/matches">
          <Icon name="users" />
                Matches
          {/* {newMatches && (
          <Label color="red" size="mini" >
                    New
          </Label>
                )} */}
        </Link>
      </Menu.Item>
      <Menu.Item as="div" active={activeLink === 'landlord-view'} name="landlord-view" onClick={this.handleItemClick} >
        <Link to="/landlord-view">
          <Icon name="home" />
              Upload listing
        </Link>
      </Menu.Item>
      {user.uid && (
      <Menu.Item as="div" name="logout">
        <Dropdown
          trigger={<span>{user.displayName}<Image spaced="left" src={user.photoURL} avatar /> </span>}
          options={[
                    {
                      key: 'settings',
                      text: <Link style={{ color: 'black' }} to="/account-settings">Settings</Link>,
                      icon: 'settings'
                    },
                    {
                      key: 'sign-out',
                      text: <Link style={{ color: 'black' }} to="/" onClick={logOut} >Log out</Link>,
                      icon: 'sign out'
                    },
                  ]}
          icon={null}
        />
      </Menu.Item>
          )}
      {!user.uid && (
      <Menu.Item as="div" name="signIn" onClick={this.handleItemClick}>
        <Link to="/create">
          <Icon name="sign in" />
                Log in
        </Link>
      </Menu.Item>
          )}
      {!user.uid && (
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
)

export default DesktopHeader
