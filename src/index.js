import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

import rootReducer from './reducers'
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


const store = createStore(rootReducer)


render(
  <Provider store={store}>
    <Router
      onUpdate={hashLinkScroll}
    >
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()
