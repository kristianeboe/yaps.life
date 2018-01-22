import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import RouterWrapper from './RouterWrapper';
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';

import {
  BrowserRouter as Router,
  Route,
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

ReactDOM.render(<RouterWrapper />, document.getElementById('root'));
registerServiceWorker();
