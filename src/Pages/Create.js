import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Button, Form, Icon, Divider, Message, Segment, Header } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { validEmail, validPassword } from '../utils/FormValidations'
import { logInWithProvider, toggleSignUp, logInWithEmail, signUpWithEmail } from '../actions'
import { getSignupFlag, getRedirectToProfile } from '../selectors'
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
      loading: false,
      formError: false,
      passwordMatchError: false,
      errors: {}
    }
    // this.state = initialState
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })


  render() {
    const { signUp, redirectToProfile } = this.props
    console.log(this.props)
    const {
      loading, formError, passwordMatchError, errors,
      email, password, passwordConfirm
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
            <Button color="facebook" onClick={() => this.props.loginWithProvider('FACEBOOK')}>
              <Icon name="facebook" />
            </Button>
            <Button.Or />
            <Button color="grey" onClick={() => this.props.loginWithProvider('GOOGLE')}>
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
            {signUp && (
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
            {signUp ? (
              <Button onClick={this.props.signUpWithEmail} color="orange" fluid size="large">
              Sign up
              </Button>
          ) : (
            <Button onClick={this.props.logInWithEmail} color="orange" fluid size="large">
                Log in
            </Button>
            )}
            <Message onClick={() => this.props.toggleSignUp(!signUp)} >
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

export default connect(
  state => ({
    signUp: getSignupFlag(state),
    redirectToProfile: getRedirectToProfile(state)
  }),
  dispatch => ({
    loginWithProvider: provider => dispatch(logInWithProvider(provider)),
    loginWithEmail: (email, password) => dispatch(logInWithEmail(email, password)),
    signUpWithEmail: (email, password, passwordConfirm) => dispatch(signUpWithEmail(email, password, passwordConfirm)),
    toggleSignUp: toggle => dispatch(toggleSignUp(toggle))
  })
)(Create)
