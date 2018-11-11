import { REQUEST_USER_DATA, RECEIVE_USER_DATA, LOG_OUT, LOG_OUT_SUCCESS } from '../actions'


const initialUser = {
  uid: ''
}

const user = (state = initialUser, action) => {
  switch (action.type) {
    case REQUEST_USER_DATA:
      return state
    case RECEIVE_USER_DATA:
      return action.payload.data
    case LOG_OUT:
      return state
    case LOG_OUT_SUCCESS:
      return initialUser
    default:
      return state
  }
}

export default user
