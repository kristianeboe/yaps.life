import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

import App from './App'

function hashLinkScroll() {
  const { hash } = window.location
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) element.scrollIntoView()
    }, 0)
  }
}


const RouterWrapper = () => (
  <Router
    onUpdate={hashLinkScroll}
  >
    <App />
  </Router>
)

ReactDOM.render(<RouterWrapper />, document.getElementById('root'))
registerServiceWorker()
