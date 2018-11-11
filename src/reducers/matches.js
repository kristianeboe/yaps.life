import { REQUEST_USER_MATCHES, RECEIVE_USER_MATCHES } from '../actions'

const matches = (state = {}, action) => {
  switch (action.type) {
    case REQUEST_USER_MATCHES:
      return state
    case RECEIVE_USER_MATCHES:
      return action.payload.data
    default:
      return state
  }
}

export default matches
