import { combineReducers } from 'redux'
import { reducer as burgerMenu } from 'redux-burger-menu'
import matches from './matches'
import profile from './profile'
import user from './user'
import ui from './ui'

export default combineReducers({
  matches,
  user,
  profile,
  ui,
  burgerMenu,
})
