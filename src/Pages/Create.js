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


  setPhotoURL = (photoURL, loginProvider) => {
    if (loginProvider === 'facebook') {
      return `${photoURL}?type=large&width=720&height=720`
    }
    return photoURL
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  googleSignIn = async () => {
    const userSignInOperation = await auth.signInWithPopup(googleProvider)
    console.log(userSignInOperation)
    if (userSignInOperation.additionalUserInfo.isNewUser) {
      await this.createUserInDatabase(userSignInOperation.user, 'google')
      this.setState({ redirectToProfile: true })
    } else {
      this.setState({ redirectToProfile: true })
    }
  }

  // https://graph.facebook.com/kristianeboe/mutualfriends?user=fredrik.moger&access_token=EAACJi5OZB7w8BAM89fuYenUFWGZCKwdWdVNjoUFrDMqbPZA1kDfWFZCrAzCQU3G4k2qlC6TNFBxKooJksyaNNtXC1IJecvj49DDlE0XT2LkxPqTpiuEUcZApkFUzPaZACULzdkbbU6Rq5H6GwsZB8SZBkZBO0fvs3GkJdv6llg0hsOwZDZD

  facebookLogin = async () => {
    const userSignInOperation = await auth.signInWithPopup(facebookProvider)
    // console.log(userSignInOperation)
    if (userSignInOperation.additionalUserInfo.isNewUser) {
      await this.createUserInDatabase(userSignInOperation.user, 'facebook')
      this.setState({ redirectToProfile: true })
    } else {
      this.setState({ redirectToProfile: true })
    }
  }

  createUserInDatabase = (user, loginProvider) => firestore
    .collection('users')
    .doc(user.uid)
    .set({
      uid: user.uid,
      displayName: user.displayName ? user.displayName : '',
      photoURL: user.photoURL ? this.setPhotoURL(user.photoURL, loginProvider) : '',
      email: user.email,
      phone: '',
      personalityVector: new Array(20).fill(0),
      propertyVector: new Array(4).fill(0),
      loginProvider
    })

  handleSignUp = (event) => {
    event.preventDefault()
    const { email, password, passwordConfirm } = this.state

    if (password !== passwordConfirm) {
      this.setState({ passwordMatchError: true, formError: true })
      return
    }
    this.setState({ passwordMatchError: false, formError: false, loading: true })
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        console.log(user)
        this.createUserInDatabase(user, 'email').then(() =>
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
    if (!this.validPassword(password) || !this.validEmail(email)) {
      this.setState({ formError: true })
      return
    }
    this.setState({ passwordMatchError: false, formError: false, loading: true })
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
            <Button color="facebook" onClick={this.facebookLogin}>
              <Icon name="facebook" />
            </Button>
            <Button.Or />
            <Button color="grey" onClick={this.googleSignIn}>
              <Icon name="google" />
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
              <a href="#" > {signUp ? 'Log in' : 'Sign up'}</a>&nbsp;
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
