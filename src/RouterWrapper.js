import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import App from './App'
import User from './User'

const RouterWrapper = () => (
  <Router>
    <div>
      <Route exact path="/" component={App}/>
      <Route path="/user" component={User} />
    </div>
  </Router>
)

export default RouterWrapper