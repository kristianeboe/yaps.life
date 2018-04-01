import React, { Component } from 'react'
import {
  Image,
  Button,
  Container,
  Segment,
  Form,
  Grid,
  Checkbox,
  Message,
  Label
} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from 'react-places-autocomplete'

import MatchingQuestion from './MatchingQuestion'
import {
  SOCIAL_HABBITS_QUESTIONES,
  CLEANLINESS_QUESTIONES,
  SOCIAL_OPENNESS_QUESTIONES,
  SOCIAL_FLEXIBILITY_QUESTIONES
} from './MatchingQuestions'
import firebase, { auth } from './firebase'

const genderOptions = [
  { key: 'm', text: 'Gutt', value: 'Gutt' },
  { key: 'f', text: 'Jente', value: 'Jente' }
]

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      formLoading: true,
      formSuccess: false,
      displayName: '',
      photoURL: '',
      age: '',
      gender: '',
      studyProgramme: '',
      matchLocation: '',
      workplace: '',
      workplaceLatLng: {},
      university: '',
      SOCIAL_HABBITS: {},
      CLEANLINESS: {},
      SOCIAL_OPENNESS: {},
      SOCIAL_FLEXIBILITY: {},
      q1: 3,
      q2: 3,
      q3: 3,
      q4: 3,
      q5: 3,
      q6: 3,
      q7: 3,
      q8: 3,
      q9: 3,
      q10: 3,
      q11: 3,
      q12: 3,
      q13: 3,
      q14: 3,
      q15: 3,
      q16: 3,
      q17: 3,
      q18: 3,
      q19: 3,
      q20: 3,
      redirectToSignIn: false,
      readyToMatch: false,
      tos: false
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
      if (user) {
        firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then((doc) => {
            const userData = doc.data()
            this.setState({
              formLoading: false,
              displayName: user.displayName ? user.displayName : '',
              photoURL: user.photoURL ? user.photoURL : '',
              age: userData.age ? userData.age : '',
              gender: userData.gender ? userData.gender : '',
              studyProgramme: userData.studyProgramme
                ? userData.studyProgramme
                : '',
              workplace: userData.workplace ? userData.workplace : '',
              matchLocation: userData.matchLocation
                ? userData.matchLocation
                : '',
              workplaceLatLng: userData.workplaceLatLng
                ? userData.workplaceLatLng
                : {},
              university: userData.university ? userData.university : '',
              SOCIAL_HABBITS: userData.SOCIAL_HABBITS
                ? userData.SOCIAL_HABBITS
                : {},
              CLEANLINESS: userData.CLEANLINESS ? userData.CLEANLINESS : {},
              SOCIAL_OPENNESS: userData.SOCIAL_OPENNESS
                ? userData.SOCIAL_OPENNESS
                : {},
              SOCIAL_FLEXIBILITY: userData.SOCIAL_FLEXIBILITY
                ? userData.SOCIAL_FLEXIBILITY
                : {},
              q1: userData.q1 ? userData.q1 : 3,
              q2: userData.q2 ? userData.q2 : 3,
              q3: userData.q3 ? userData.q3 : 3,
              q4: userData.q4 ? userData.q4 : 3,
              q5: userData.q5 ? userData.q5 : 3,
              q6: userData.q6 ? userData.q6 : 3,
              q7: userData.q7 ? userData.q7 : 3,
              q8: userData.q8 ? userData.q8 : 3,
              q9: userData.q9 ? userData.q9 : 3,
              q10: userData.q10 ? userData.q10 : 3,
              q11: userData.q11 ? userData.q11 : 3,
              q12: userData.q12 ? userData.q12 : 3,
              q13: userData.q13 ? userData.q13 : 3,
              q14: userData.q14 ? userData.q14 : 3,
              q15: userData.q15 ? userData.q15 : 3,
              q16: userData.q16 ? userData.q16 : 3,
              q17: userData.q17 ? userData.q17 : 3,
              q18: userData.q18 ? userData.q18 : 3,
              q19: userData.q19 ? userData.q19 : 3,
              q20: userData.q20 ? userData.q20 : 3,
              readyToMatch: userData.readyToMatch
                ? userData.readyToMatch
                : false,
              tos: userData.tos ? userData.tos : false
            })
          })
      } else {
        this.setState({
          redirectToSignIn: true
        })
      }
    })
  }

  handleSliderChange = (value, name, type) => {
    this.setState({
      [name]: value
    })
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    this.setState({ formLoading: true })
    const userData = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      studyProgramme: this.state.studyProgramme,
      workplace: this.state.workplace,
      workplaceLatLng: this.state.workplaceLatLng,
      university: this.state.university,
      matchLocation: this.state.matchLocation,
      q1: this.state.q1,
      q2: this.state.q2,
      q3: this.state.q3,
      q4: this.state.q4,
      q5: this.state.q5,
      q6: this.state.q6,
      q7: this.state.q7,
      q8: this.state.q8,
      q9: this.state.q9,
      q10: this.state.q10,
      q11: this.state.q11,
      q12: this.state.q12,
      q13: this.state.q13,
      q14: this.state.q14,
      q15: this.state.q15,
      q16: this.state.q16,
      q17: this.state.q17,
      q18: this.state.q18,
      q19: this.state.q19,
      q20: this.state.q20,
      readyToMatch: this.state.readyToMatch,
      tos: this.state.tos,
      uid: this.state.user.uid,
      photoURL: this.state.user.photoURL
    }

    firebase
      .firestore()
      .collection('users')
      .doc(this.state.user.uid)
      .set(userData, { merge: true })
      .then(() => {
        this.setState({ formLoading: false, formSuccess: true })
      })
  }

  render() {
    if (this.state.redirectToSignIn) {
      return (
        <Redirect
          push
          to={{
            pathname: '/create',
            state: { redirectToProfile: true }
          }}
        />
      )
    }

    if (this.state.redirectToMatch) {
      return (
        <Redirect
          push
          to={{
            pathname: '/match',
            state: { redirectToMatch: true }
          }}
        />
      )
    }

    const {
      formLoading,
      formSuccess,
      displayName,
      age,
      gender,
      studyProgramme,
      matchLocation,
      university,
      photoURL,
      readyToMatch,
      tos
    } = this.state

    // if (!user) return <Redirect push to="login" />

    return (
      <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
        <Segment raised className="you" loading={this.state.formLoading}>
          <Form
            loading={formLoading}
            success={formSuccess}
            onSubmit={this.handleSubmit}
          >
            <Grid columns="equal" stackable>
              <Grid.Column>
                <h1>Her er deg i dag</h1>
                <Form.Input
                  fluid
                  label="Name"
                  placeholder="Name"
                  name="displayName"
                  value={displayName}
                />
                <Form.Group widths="equal">
                  <Form.Input
                    fluid
                    label="Alder"
                    placeholder="Alder"
                    name="age"
                    value={age}
                    onChange={this.handleChange}
                  />
                  <Form.Select
                    fluid
                    label="Kjønn"
                    options={genderOptions}
                    placeholder="Kjønn"
                    value={gender}
                    name="gender"
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group widths="equal">
                  <Form.Input
                    fluid
                    label="Studie"
                    placeholder="Studie"
                    name="studyProgramme"
                    value={studyProgramme}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    fluid
                    label="Universitet"
                    placeholder="Universitet"
                    name="university"
                    value={university}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Input
                  fluid
                  label="Hvor skal du flytte?"
                  placeholder="Område du vil bli matchet til"
                  name="matchLocation"
                  value={matchLocation}
                  onChange={this.handleChange}
                />
                <Form.Field required>
                  <label>Address of workplace</label>
                  <PlacesAutocomplete
                    styles={{ root: { zIndex: 50 } }}
                    inputProps={{
                      name: 'workplace',
                      placeholder: 'Where are you going to work?',
                      value: this.state.workplace,
                      onChange: (workplace) => {
                        this.setState({
                          workplace
                        })
                      }
                    }}
                    renderFooter={() => (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          padding: '4px'
                        }}
                      >
                        <div>
                          <img
                            src={require('./powered_by_google_default.png')}
                            style={{ display: 'inline-block', width: '150px' }}
                            alt="Powered by Google"
                          />
                        </div>
                      </div>
                    )}
                    onSelect={(workplace) => {
                      this.setState({ workplace })
                      geocodeByAddress(workplace)
                        .then(results => getLatLng(results[0]))
                        .then(({ lat, lng }) => {
                          this.setState({
                            workplaceLatLng: {
                              lat,
                              lng
                            }
                          })
                        })
                        .catch((error) => {
                          console.log('Oh no!', error)
                          this.setState({
                            workplaceLatLng: null // this.renderGeocodeFailure(error),
                          })
                        })
                    }}
                    shouldFetchSuggestions={({ value }) => value.length > 2}
                    highlightFirstSuggestion
                    options={{
                      types: ['establishment']
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Price </label>
                  <Button.Group fluid >
                    <Button >One</Button>
                    <Button.Or />
                    <Button >Two</Button>
                    <Button.Or />
                    <Button >Three</Button>
                  </Button.Group>
                </Form.Field>
                <Form.Field required>
                  <Checkbox
                    label="Agree to TOS"
                    checked={tos}
                    onChange={val => this.setState({ tos: !this.state.tos })}
                  />
                </Form.Field>
                <Form.Field>
                  <Checkbox
                    label="Make my profile visible"
                    checked={readyToMatch}
                    onChange={val =>
                      this.setState({ readyToMatch: !this.state.readyToMatch })
                    }
                  />
                </Form.Field>
                <Form.Button type="submit">Save</Form.Button>

                <Button
                  onClick={() => this.setState({ redirectToMatch: true })}
                >
                  Create match
                </Button>
              </Grid.Column>
              <Grid.Column
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {/* <Image circular src={photoURL} size="medium" /> */}
                <Image
                  circular
                  src={
                    photoURL || 'https://placem.at/people?w=250&h=250&random=1'
                  }
                  size="medium"
                />
                {/* <Form.Button>{photoURL ? 'Change profile image' : 'Upload profile image'}</Form.Button> */}
              </Grid.Column>
            </Grid>
            <Message success header="Profil oppdatert" content="Chill!" />
          </Form>
        </Segment>

        <Grid stackable columns="equal">
          <Grid.Row>
            <Grid.Column>
              <Segment
                style={{ minHeight: '35em' }}
                loading={this.state.formLoading}
              >
                <h1>Social habbits</h1>
                {SOCIAL_HABBITS_QUESTIONES.map(question => (
                  <MatchingQuestion
                    key={question.key}
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    value={this.state[question.key]}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment
                style={{ minHeight: '35em' }}
                loading={this.state.formLoading}
              >
                <h1>Cleanliness</h1>
                {CLEANLINESS_QUESTIONES.map(question => (
                  <MatchingQuestion
                    key={question.key}
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    value={this.state[question.key]}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Segment
                style={{ minHeight: '35em' }}
                loading={this.state.formLoading}
              >
                <h1>Social openness</h1>
                {SOCIAL_OPENNESS_QUESTIONES.map(question => (
                  <MatchingQuestion
                    key={question.key}
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    value={this.state[question.key]}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment
                style={{ minHeight: '35em' }}
                loading={this.state.formLoading}
              >
                <h1>Social flexibility</h1>
                {SOCIAL_FLEXIBILITY_QUESTIONES.map(question => (
                  <MatchingQuestion
                    key={question.key}
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    value={this.state[question.key]}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

export default Profile
