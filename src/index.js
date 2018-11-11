import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import 'semantic-ui-css/semantic.min.css'

import './index.css'
import registerServiceWorker from './registerServiceWorker'
import rootReducer from './reducers'
import Root from './Root'
import { logger, crashReporter } from './middleware'

registerServiceWorker()
const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, logger, crashReporter)
)

// store.dispatch({ type: 'CHANGE_PROFILE', key: 'displayName', value: 'Bob' })
// store.dispatch(fetchUserData('123445')).then(() => console.log(store.getState()))

render(<Root store={store} />, document.getElementById('root'))

/* function hashLinkScroll() {
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
} */
