import React from 'react'
import { Route, Switch } from 'react-router-dom'
import AppHeader from './Components/AppHeader'
import Home from './Pages/Home'
// import Register from './Pages/Register'
import Create from './Pages/Create'
import Profile from './Pages/Profile'
import Match from './Pages/Match'
import MatchList from './Pages/MatchList'
import TOS from './Pages/TOS'

const App = () => (
  <div className="app">
    <AppHeader />
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/create" component={Create} />
      <Route path="/matches/:matchId" component={Match} />
      <Route path="/matches" component={MatchList} />
      <Route path="/profile" component={Profile} />
      <Route path="/TOS" component={TOS} />
    </Switch>
  </div>
)

export default App
