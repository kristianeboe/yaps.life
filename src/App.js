import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { getMatches, getUser } from './selectors'
import { auth, firestore } from './firebase'
import AppHeader from './Components/AppHeader'
import Home from './Pages/Home'
// import Register from './Pages/Register'
import Create from './Pages/Create'
import Profile from './Pages/Profile'
import Match from './Pages/Match'
import MatchList from './Pages/MatchList'
import AccountSettings from './Pages/AccountSettings'
// import LandlordProfie from './Components/LandlordProfile'
import ApartmentFinder from './Pages/ApartmentFinder'
import TOS from './Pages/TOS'
import { fetchUserData, logInWithProvider } from './actions'

class App extends Component {
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.props.fetchUserData(user.uid)
      }
    })
  }

  render() {
    return (
      <div className="app">
        {/* //user={user} newMatches={userData ? userData.newMatches : false} */}
        <AppHeader />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/create" component={Create} />
          <Route path="/matches/:matchId" component={Match} />
          <Route path="/matches" component={MatchList} />
          <Route path="/profile" component={Profile} />
          {/* <Route path="/landlord-view" component={LandlordProfie} /> */}
          <Route path="/apartment-finder/:matchId" component={ApartmentFinder} />
          <Route path="/TOS" component={TOS} />
          <Route path="/account-settings" component={AccountSettings} />
        </Switch>
      </div>
    )
  }
}

export default withRouter(connect(
  state => ({
    matches: getMatches(state),
    user: getUser(state),
  }),
  dispatch => ({
    fetchUserData: uid => dispatch(fetchUserData(uid)),
    logInWithProvider: provider => dispatch(logInWithProvider(provider))
  })
)(App))
