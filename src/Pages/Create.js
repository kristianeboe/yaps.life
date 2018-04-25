import React, { Component } from 'react'
import { Container, Button, Form, Icon, Divider, Message, Segment, Header } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { firestore, auth, googleProvider, facebookProvider } from '../firebase'
import { validEmail, validPassword } from '../utils/FormValidations'
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
      signUp: props.location.state ? props.location.state.signUp : false,
      redirectToProfile: false,
      loading: false,
      formError: false,
      passwordMatchError: false,
      errors: {}
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
    firestore
      .collection('users')
      .doc(user.uid)
      .set({
        uid: user.uid,
        displayName: user.displayName ? user.displayName : '',
        photoURL: user.photoURL ? user.photoURL : '',
        email: user.email,
        phone: '',
        answerVector: new Array(20).fill(0),
        propertyVector: new Array(4).fill(0),
      })
      .then(() => resolve())
      .catch(error => reject(error))
  })

  handleSignUp = (event) => {
    event.preventDefault()
    const { email, password, passwordConfirm } = this.state

    if (password !== passwordConfirm) {
      this.setState({ passwordMatchError: true, formError: true })
      return
    }
    this.setState({ passwordMatchError: false, formError: false })
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
    if (!this.validatePassword(password) || !this.validateEmail(email)) {
      this.setState({ formError: true })
      return
    }
    this.setState({ passwordMatchError: false, formError: false })
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
      signUp, redirectToProfile, loading, formError, passwordMatchError, errors,
      email, password, passwordConfirm,
    } = this.state
    console.log(this.state)
    console.log(this.props)
    // && this.props.location.state ? this.props.location.state.redirectToProfile : false
    if (redirectToProfile) {
      return <Redirect push to="/profile" />
    }
    return (
      <Container style={{ paddingTop: '5em', width: '50em' }}>
        <Segment>
          <Header as="h1" >
            {signUp ? 'Sign up' : 'Log in'}
            <Header.Subheader>
              {signUp ? 'Create a profile to find the perfect flatmates and figure out where to live' : 'Log in to view your profile and matches'}
            </Header.Subheader>
          </Header>
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
          <Form loading={loading} error={formError} >
            <Form.Input
              fluid
              icon="mail"
              iconPosition="left"
              placeholder="E-mail address"
              name="email"
              value={email}
              onChange={this.handleChange}
              onBlur={() => this.setState({ errors: { ...errors, email: !validEmail(email) } })}
              error={errors.email}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              onBlur={() => this.setState({ errors: { ...errors, password: !validPassword(password) } })}
              error={errors.password}
            />
            {this.state.signUp && (
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Confirm Password"
              type="password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={this.handleChange}
              onBlur={() => this.setState({ errors: { ...errors, passwordConfirm: !validPassword(passwordConfirm) || passwordConfirm === password } })}
              error={errors.passwordConfirm}
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
              header={passwordMatchError ? 'Something is wrong with the email or password' : 'Passwords do not match'}
              content="Please do something about it"
            />
          </Form>
        </Segment>
      </Container>
    )
  }
}

export default Create
