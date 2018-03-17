import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';

import {
  BrowserRouter as Router,
  Route, Switch,
} from 'react-router-dom'
import Home from './Home'
import User from './User'
import Register from './Register'
import SignUp from './SignUp';

const RouterWrapper = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route exact path="/sign-in" component={SignUp}/>
      <Route path="/user" component={User} />
      <Route path="/register" component={Register} />
    </Switch>
  </Router>
)

ReactDOM.render(<RouterWrapper />, document.getElementById('root'));
registerServiceWorker();