import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';

import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'
import Home from './Home'
import User from './User'
import Register from './Register'

const RouterWrapper = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home}/>
      <Route path="/user" component={User} />
      <Route path="/register" component={Register} />
    </div>
  </Router>
)

ReactDOM.render(<RouterWrapper />, document.getElementById('root'));
registerServiceWorker();