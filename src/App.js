import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { auth, firestore } from './firebase'
import AppHeader from './Components/AppHeader'
import Home from './Pages/Home'
// import Register from './Pages/Register'
import Create from './Pages/Create'
import Profile from './Pages/Profile'
import Match from './Pages/Match'
import MatchList from './Pages/MatchList'
import AccountSettings from './Pages/AccountSettings'
import LandlordProfie from './Components/LandlordProfile'
import TOS from './Pages/TOS'

class App extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.state = {
      user: null,
      userData: {},
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.unsubscribe = firestore.collection('users').doc(user.uid).onSnapshot(doc => this.setState({ user, userData: doc.data() }))
      } else {
        this.setState({ user, userData: {} })
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }
  render() {
    const { user, userData } = this.state
    return (
      <div className="app">
        <AppHeader user={user} newMatches={userData ? userData.newMatches : false} />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/create" component={Create} />
          <Route path="/matches/:matchId" component={Match} />
          <Route path="/matches" component={MatchList} />
          <Route path="/profile" component={Profile} />
          <Route path="/landlord-view" component={LandlordProfie} />
          <Route path="/TOS" component={TOS} />
          <Route path="/account-settings" component={AccountSettings} />
        </Switch>
      </div>
    )
  }
}

export default App
