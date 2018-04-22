import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import firebase, { auth } from 'firebase'
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
    this.state = {
      user: null,
    }
  }
  componentDidMount() {
    auth().onAuthStateChanged((user) => {
      this.setState({ user })
    })
  }
  render() {
    return (
      <div className="app">
        <AppHeader />
        <Switch>
          <Route exact path="/" component={() => <Home user={this.state.user} />} />
          <Route exact path="/create" component={Create} />
          <Route path="/matches/:matchId" component={Match} />
          <Route path="/matches" component={MatchList} />
          <Route path="/profile" component={Profile} />
          <Route path="/upload-property" component={LandlordProfie} />
          <Route path="/TOS" component={TOS} />
        </Switch>
      </div>
    )
  }
}

export default App
