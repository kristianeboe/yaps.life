import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AppHeader from "./AppHeader";
import Home from "./Home";
import User from "./User";
import Register from "./Register";
import SignUp from "./SignUp";
import Matching from "./Matching";

class App extends Component {
  render() {
    return (
      <div className="app">
        <AppHeader />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={SignUp} />
          <Route path="/user" component={User} />
          <Route path="/register" component={Register} />
          <Route path="/matching" component={Matching} />
        </Switch>
      </div>
    );
  }
}

export default App;
