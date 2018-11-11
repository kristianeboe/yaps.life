import { SET_ACTIVE_LINK, REDIRECT, TOGGLE_SIGNUP } from '../actions'

const ui = (state = { burgerMenuIsOpen: false, signupFlag: false }, action) => {
  switch (action.type) {
    case SET_ACTIVE_LINK:
      return {
        ...state,
        activeLink: action.payload.activeLink
      }
    case REDIRECT:
      return {
        ...state,
        [`redirectTo${action.payload.page}`]: true
      }
    case TOGGLE_SIGNUP:
      return {
        ...state,
        signupFlag: action.payload.flag
      }
    default:
      return state
  }
}

export default ui
