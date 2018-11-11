import thunkMiddleware from 'redux-thunk'

// import * as Sentry from '@sentry/browser'

/**
 * Logs all actions and states after they are dispatched.
 */
export const logger = store => next => (action) => {
  console.group(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

/**
 * Sends crash reports as state is updated and listeners are notified.
 */
export const crashReporter = store => next => (action) => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    /* Sentry.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    }) */
    throw err
  }
}
