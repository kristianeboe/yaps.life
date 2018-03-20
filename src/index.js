import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';

import {
  BrowserRouter as Router,
  Route, Switch,
} from 'react-router-dom'
import App from './App'

const RouterWrapper = () => (
  <Router>
    <App />
  </Router>
)

ReactDOM.render(<RouterWrapper />, document.getElementById('root'));
registerServiceWorker();