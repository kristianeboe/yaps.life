import { createSelector } from 'reselect'

export const getUser = state => state.user
export const getMatches = state => state.matches
export const getActiveLink = state => state.ui.activeLink
export const isBurgerMenuOpen = state => state.burgerMenu.isOpen
export const getSignupFlag = state => state.ui.signupFlag
export const getRedirectToProfile = state => state.ui.redirectToProfile

export const getRecentMatches = createSelector(
  getMatches,
  ({ matches }) => matches.filter(match => match.id)
)
