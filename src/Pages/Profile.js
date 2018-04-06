import React, { Component } from 'react'
import {
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
import axios from 'axios'
import googleLogo from '../assets/images/powered_by_google_default.png'
import MatchingQuestion from '../Components/MatchingQuestion'
import {
  SOCIAL_HABBITS_QUESTIONES,
  CLEANLINESS_QUESTIONES,
  SOCIAL_OPENNESS_QUESTIONES,
  SOCIAL_FLEXIBILITY_QUESTIONES
} from '../assets/MatchingQuestions'
import firebase, { auth } from '../firebase'
import MateCard from '../Components/MateCard'
import personAvatar from '../assets/images/personAvatar.png'

const genderOptions = [
  { key: 'm', text: 'Gutt', value: 'Gutt' },
  { key: 'f', text: 'Jente', value: 'Jente' }
]

class Profile extends Component {
  constructor(props) {
    super(props)

    const questions = {}
    const answerVector = new Array(20 + 1).join('0').split('').map(parseFloat)
    for (let index = 0; index < answerVector.length; index += 1) {
      const answer = answerVector[index]
      questions[`q${index + 1}`] = answer + 3
    }
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
      budget: 0,
      university: '',
      ...questions,
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
            const questions = {}
            const answerVector = userData.answerVector ? userData.answerVector : []
            for (let index = 0; index < answerVector.length; index += 1) {
              const answer = answerVector[index]
              questions[`q${index + 1}`] = answer + 3
            }
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
              budget: userData.budget ? userData.budget : 0,
              matchLocation: userData.matchLocation
                ? userData.matchLocation
                : '',
              workplaceLatLng: userData.workplaceLatLng
                ? userData.workplaceLatLng
                : {},
              university: userData.university ? userData.university : '',
              ...questions,
              readyToMatch: userData.readyToMatch
                ? userData.readyToMatch
                : false,
              tos: userData.tos ? userData.tos : false,
            })
          })
      } else {
        this.setState({
          redirectToSignIn: true
        })
      }
    })
  }

  handleSliderChange = (value, name) => {
    this.setState({
      [name]: value
    })
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleBudget = (e, value) => {
    e.preventDefault()
    this.setState({
      budget: value
    })
  }
  handleSize = (e, value) => {
    e.preventDefault()
    this.setState({
      size: value
    })
  }
  handleSize = (e, value) => {
    e.preventDefault()
    this.setState({
      size: value
    })
  }

  handleNewness = (e, value) => {
    e.preventDefault()
    this.setState({
      newness: value
    })
  }

  handleSubmit = () => {
    this.setState({ formLoading: true })
    const answerVector = []
    for (let q = 0; q < 20; q += 1) {
      answerVector.push(this.state[`q${q + 1}`] - 3)
    }
    const userData = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      studyProgramme: this.state.studyProgramme,
      workplace: this.state.workplace,
      workplaceLatLng: this.state.workplaceLatLng,
      university: this.state.university,
      matchLocation: this.state.matchLocation,
      budget: this.state.budget,
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
      photoURL: this.state.user.photoURL,
      answerVector
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

  getMatched = (e) => {
    e.preventDefault()
    axios
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getMatchedByClusterOnSave', {})
      .then((response) => {
        console.log(response)
        this.setState({ redirectToMatch: true })
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
                            src={googleLogo}
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
                  <label>Budget</label>
                  <Button.Group fluid >
                    <Button primary={this.state.budget === 1} onClick={e => this.handleBudget(e, 1)} >Cheap</Button>
                    <Button.Or />
                    <Button primary={this.state.budget === 2} onClick={e => this.handleBudget(e, 2)} >Decent</Button>
                    <Button.Or />
                    <Button primary={this.state.budget === 3} onClick={e => this.handleBudget(e, 3)} >Premium</Button>
                  </Button.Group>
                </Form.Field>
                <Form.Field>
                  <label>Size</label>
                  <Button.Group fluid >
                    <Button primary={this.state.size === 1} onClick={e => this.handleSize(e, 1)} >Smallish</Button>
                    <Button.Or />
                    <Button primary={this.state.size === 2} onClick={e => this.handleSize(e, 2)} >Big</Button>
                    <Button.Or />
                    <Button primary={this.state.size === 3} onClick={e => this.handleSize(e, 3)} >Huge</Button>
                  </Button.Group>
                </Form.Field>
                <Form.Field>
                  <label>Newness</label>
                  <Button.Group fluid >
                    <Button primary={this.state.newness === 1} onClick={e => this.handleNewness(e, 1)} >I like classic</Button>
                    <Button.Or />
                    <Button primary={this.state.newness === 2} onClick={e => this.handleNewness(e, 2)} >Newish</Button>
                    <Button.Or />
                    <Button primary={this.state.newness === 3} onClick={e => this.handleNewness(e, 3)} >Brand new</Button>
                  </Button.Group>
                </Form.Field>
                <Form.Field required>
                  <Checkbox
                    label="Agree to TOS"
                    checked={tos}
                    onChange={() => this.setState({ tos: !this.state.tos })}
                  />
                </Form.Field>
                <Form.Field>
                  <Checkbox
                    label="Make my profile visible"
                    checked={readyToMatch}
                    onChange={() =>
                      this.setState({ readyToMatch: !this.state.readyToMatch })
                    }
                  />
                </Form.Field>
                <Form.Button type="submit">Save</Form.Button>
                <Form.Button onClick={this.getMatched} >Get matched demo</Form.Button>
              </Grid.Column>
              <Grid.Column
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {/* <Image circular src={photoURL} size="medium" /> */}
                <MateCard
                  photoURL={photoURL || personAvatar}
                  displayName={this.state.displayName}
                  workplace={this.state.workplace}
                  studyProgramme={this.state.studyProgramme}
                  university={this.state.university}
                  gender={this.state.gender}
                  budget={this.state.budget}
                  matchLocation={this.state.matchLocation}
                  similarityScore={100}
                />
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
