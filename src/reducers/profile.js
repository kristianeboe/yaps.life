const CHANGE_PROFILE = 'CHANGE_PROFILE'

const initialProfile = {
  displayName: ''
}

const profile = (state = initialProfile, action) => {
  switch (action.type) {
    case CHANGE_PROFILE:
      return {
        ...state,
        [action.payload.key]: action.payload.value
      }
    default:
      return state
  }
}

export default profile
