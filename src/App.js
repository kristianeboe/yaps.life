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
import LandlordProfie from './Components/LandlordProfile'
import TOS from './Pages/TOS'

class App extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.state = {
      userData: {},
    }
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.unsubscribe = firestore.collection('users').doc(user.uid).onSnapshot(doc => this.setState({ userData: doc.data() }))
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }
  render() {
    const { userData } = this.state
    return (
      <div className="app">
        <AppHeader user={userData} />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/create" component={Create} />
          <Route path="/matches/:matchId" component={Match} />
          <Route path="/matches" component={MatchList} />
          <Route path="/profile" component={Profile} />
          <Route path="/landlord-view" component={LandlordProfie} />
          <Route path="/TOS" component={TOS} />
        </Switch>
      </div>
    )
  }
}

export default App
