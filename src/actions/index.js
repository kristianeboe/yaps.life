import { action as toggleMenu } from 'redux-burger-menu'
import { firestore, auth, googleProvider, facebookProvider } from '../firebase'

export const REQUEST_USER_DATA = 'REQUEST_USER_DATA'
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'

export const REQUEST_USER_MATCHES = 'REQUEST_USER_MATCHES'
export const RECEIVE_USER_MATCHES = 'RECEIVE_USER_MATCHES'

export const SET_ACTIVE_LINK = 'SET_ACTIVE_LINK'

export const LOG_IN = 'LOG_IN'
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS'
export const SIGNIN_METHODS = {
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
  EMAIL: 'EMAIL'
}

export const LOG_OUT = 'LOG_OUT'
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS'
export const REDIRECT = 'REDIRECT'
export const TOGGLE_SIGNUP = 'TOGGLE_SIGNUP'

export function logInUser() {
  return {
    type: LOG_IN
  }
}
export function logInUserSuccess() {
  return {
    type: LOG_IN_SUCCESS
  }
}

export function logOutUser() {
  return {
    type: LOG_OUT
  }
}
export function logOutUserSuccess() {
  return {
    type: LOG_OUT_SUCCESS
  }
}


export function redirect(page) {
  return {
    type: REDIRECT,
    payload: {
      page
    }
  }
}

export function toggleSignUp(flag) {
  return {
    type: TOGGLE_SIGNUP,
    payload: {
      flag
    }
  }
}

export function setActiveLink(linkId) {
  return {
    type: SET_ACTIVE_LINK,
    payload: {
      linkId
    }
  }
}


function requestUserData(userId) {
  return {
    type: REQUEST_USER_DATA,
    payload: {
      userId
    }
  }
}

function requestUserMatches() {
  return {
    type: REQUEST_USER_MATCHES,
  }
}

function receiveUserData(userId, userData) {
  return {
    type: RECEIVE_USER_DATA,
    payload: {
      userId,
      data: userData,
      receivedAt: Date.now()
    }
  }
}

function receiveUserMatches(userMatches) {
  return {
    type: RECEIVE_USER_MATCHES,
    payload: {
      data: userMatches,
      receivedAt: Date.now()
    }
  }
}

function fetchUserMatches(matchIds) {
  return async (dispatch) => {
    dispatch(requestUserMatches())
    const matches = await Promise.all(Object.keys(matchIds).map(id => firestore.collection('matches').doc(id).get()))
    dispatch(receiveUserMatches(matches.map(match => match.data())))
  }
}

export function fetchUserData(uid) {
  return async (dispatch) => {
    dispatch(requestUserData(uid))
    const user = await firestore.collection('users').doc(uid).get()
    const data = user.data()
    dispatch(fetchUserMatches(data.currentMatches))
    dispatch(receiveUserData(uid, user.data()))
  }
}

const setPhotoURL = (photoURL, loginProvider) => {
  if (loginProvider === SIGNIN_METHODS.FACEBOOK) {
    return `${photoURL}?type=large&width=720&height=720`
  }
  return photoURL
  // https://graph.facebook.com/kristianeboe/mutualfriends?user=fredrik.moger&access_token=EAACJi5OZB7w8BAM89fuYenUFWGZCKwdWdVNjoUFrDMqbPZA1kDfWFZCrAzCQU3G4k2qlC6TNFBxKooJksyaNNtXC1IJecvj49DDlE0XT2LkxPqTpiuEUcZApkFUzPaZACULzdkbbU6Rq5H6GwsZB8SZBkZBO0fvs3GkJdv6llg0hsOwZDZD
}

const createUserInDatabase = (user, loginProvider) => firestore
  .collection('users')
  .doc(user.uid)
  .set({
    uid: user.uid,
    displayName: user.displayName ? user.displayName : '',
    photoURL: user.photoURL ? setPhotoURL(user.photoURL, loginProvider) : '',
    email: user.email,
    phone: '',
    personalityVector: new Array(20).fill(0),
    propertyVector: new Array(4).fill(0),
    loginProvider
  })

export function logInWithProvider(method) {
  return async (dispatch) => {
    dispatch(logInUser())
    const provider = method === SIGNIN_METHODS.GOOGLE ? googleProvider : facebookProvider
    const userSignInOperation = await auth.signInWithPopup(provider)
    if (userSignInOperation.additionalUserInfo.isNewUser) {
      await createUserInDatabase(userSignInOperation.user, method)
    }
    dispatch(redirect('Profile'))
    dispatch(logInUserSuccess())
  }
}

export function signUpWithEmail(email, password, passwordConfirm) {
  return async (dispatch) => {
    if (password !== passwordConfirm) {
      console.log('passwordMatchError')
      return
      // dispatch(passwordMatchError())
    // this.setState({ passwordMatchError: true, formError: true })
    }
    dispatch(logInUser()) // signupStart
    // this.setState({ passwordMatchError: false, formError: false, loading: true })
    const user = await auth.createUserWithEmailAndPassword(email, password)
    await this.createUserInDatabase(user, SIGNIN_METHODS.EMAIL)
    dispatch(redirect('Profile'))
    dispatch(logInUserSuccess()) // signupFinish
  }
}

export function logInWithEmail(email, password) {
  return async (dispatch) => {
    dispatch(logInUser())
    await auth.signInWithEmailAndPassword(email, password)
    dispatch(redirect('Profile'))
    dispatch(logInUserSuccess())
  }
}

export function logOut() {
  return async (dispatch) => {
    dispatch(toggleMenu(false))
    dispatch(logOutUser())
    await auth.signOut()
    dispatch(logOutUserSuccess())
  }
}
