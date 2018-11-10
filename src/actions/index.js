const nextMatchId = 0

export const addMatch = text => ({
  type: 'ADD_MATCH',
  id: nextMatchId,
  text
})
