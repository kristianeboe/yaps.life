import React from 'react'
import { Route, Switch } from 'react-router-dom'
import AppHeader from './AppHeader'
import Home from './Home'
// import Register from './Register'
import Create from './Create'
import Profile from './Profile'
import Match from './Match'
import MatchList from './MatchList'

const App = () => (
  <div className="app">
    <AppHeader />
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/create" component={Create} />
      <Route path="/matches/:matchId" component={Match} />
      <Route path="/matches" component={MatchList} />
      <Route path="/profile" component={Profile} />
      {/* <Route path="/register" component={Register} /> */}
    </Switch>
  </div>
)

export default App
