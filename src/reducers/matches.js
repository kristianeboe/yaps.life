const matches = (state = [], action) => {
  switch (action.type) {
    case 'ADD_MATCH':
      return [
        ...state,
        {
          id: action.id,
          flatmates: action.flatmates,
        }
      ]
    default:
      return state
  }
}

export default matches
