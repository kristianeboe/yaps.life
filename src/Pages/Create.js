import React, { Component } from 'react'
import { Container, Button, Form, Icon, Divider, Message, Segment } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import firebase, { auth, googleProvider, facebookProvider } from '../firebase'

// const initialState = {
//   email: 'kristian.e.boe@crux.no',
//   password: 'Crux2005',
//   signUp: false,
// }

class Create extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      signUp: false,
      redirectToProfile: false,
      loading: false,
      passwordError: false
    }
    // this.state = initialState
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  googleSignIn = () => {
    auth.signInWithPopup(googleProvider).then((userSignInOperation) => {
      console.log(userSignInOperation)
      if (userSignInOperation.additionalUserInfo.isNewUser) {
        this.createUserInDatabase(userSignInOperation.user).then(() => this.setState({ redirectToProfile: true }))
      } else {
        this.setState({ redirectToProfile: true })
      }
    })
  }

  facebookLogin = () => {
    auth.signInWithPopup(facebookProvider).then((userSignInOperation) => {
      if (!userSignInOperation.additionalUserInfo.isNewUser) return
      this.createUserInDatabase(userSignInOperation.user).then(() => this.setState({ redirectToProfile: true }))
    })
  }

  createUserInDatabase = user => new Promise((resolve, reject) => {
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        uid: user.uid,
        displayName: user.displayName ? user.displayName : '',
        photoURL: user.photoURL ? user.photoURL : '',
        email: user.email,
      })
      .then(() => resolve())
      .catch(error => reject(error))
  })

  handleSignUp = (event) => {
    event.preventDefault()
    const { email, password, passwordConfirm } = this.state

    if (password !== passwordConfirm) {
      this.setState({ passwordError: true })
      return
    }
    this.setState({ passwordError: false })
    this.setState({ loading: true })
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        console.log(user)
        this.createUserInDatabase(user).then(() =>
          this.setState({
            email: '',
            password: '',
            loading: false,
            redirectToProfile: true,
          }))
      })
      .catch((error) => {
        // Handle Errors here.
        console.log(error)
        // ...
      })
  }

  handleSignIn = (event) => {
    event.preventDefault()
    const { email, password } = this.state
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({
          email: '',
          password: '',
          redirectToProfile: true,
        })
      })
      .catch((error) => {
        // Handle Errors here.
        console.log(error)
        // ...
      })
  }

  render() {
    const {
      signUp, redirectToProfile, loading, passwordError
    } = this.state
    // && this.props.location.state ? this.props.location.state.redirectToProfile : false
    if (redirectToProfile) {
      return <Redirect push to="/profile" />
    }
    return (
      <Container style={{ paddingTop: '5em', width: '50em' }}>
        <Segment>
          <Button.Group size="large" style={{ display: 'flex' }}>
            <Button color="grey" onClick={this.googleSignIn}>
              <Icon name="google" />
            </Button>
            <Button.Or />
            <Button color="facebook" onClick={this.facebookLogin}>
              <Icon name="facebook" />
            </Button>
          </Button.Group>
          <Divider horizontal>Or</Divider>
          <Form loading={loading} error={passwordError} >
            <Form.Input
              fluid
              icon="mail"
              iconPosition="left"
              placeholder="E-mail address"
              name="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleChange}
            />
            {this.state.signUp && (
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Confirm Password"
              type="password"
              name="passwordConfirm"
              value={this.state.passwordConfirm}
              onChange={this.handleChange}
            />
            )}
            {this.state.signUp ? (
              <Button onClick={this.handleSignUp} color="orange" fluid size="large">
              Sign up
              </Button>
          ) : (
            <Button onClick={this.handleSignIn} color="orange" fluid size="large">
                Log in
            </Button>
            )}
            <Message onClick={() => this.setState({ signUp: !signUp })} >
              <Icon name="help" />
              {signUp ? 'Already have a user?' : 'New to us?'}{' '}
              <a> {signUp ? 'Log in' : 'Sign up'}</a>&nbsp;
            </Message>
            <Message
              error
              header="Passwords do not match"
              content="Please do something about it"
            />
          </Form>
        </Segment>
      </Container>
    )
  }
}

export default Create
