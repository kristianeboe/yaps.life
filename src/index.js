import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

import App from './App'

const RouterWrapper = () => (
  <Router>
    <App />
  </Router>
)

ReactDOM.render(<RouterWrapper />, document.getElementById('root'))
registerServiceWorker()
