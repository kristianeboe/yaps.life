import React, { Component } from 'react'
import {
  Button,
  Container,
  Segment,
  Form,
  Grid,
  Checkbox,
  Message,
  Label,
  Popup,
  Header
} from 'semantic-ui-react'
import { Redirect, Link } from 'react-router-dom'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from 'react-places-autocomplete'
import googleLogo from '../assets/images/powered_by_google_default.png'
import MatchingQuestion from '../Components/MatchingQuestion'
import {
  SOCIAL_HABBITS_QUESTIONES,
  CLEANLINESS_QUESTIONES,
  SOCIAL_OPENNESS_QUESTIONES,
  SOCIAL_FLEXIBILITY_QUESTIONES
} from '../assets/MatchingQuestions'
import firebase, { auth } from '../firebase'
import MateCard from '../Containers/MateCard'
import personAvatar from '../assets/images/personAvatar.png'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'Male' },
  { key: 'f', text: 'Female', value: 'Female' }
]

const universityOptions = [
  { key: 'ntnu', text: 'NTNU', value: 'NTNU' },
  { key: 'nhh', text: 'NHH', value: 'NHH' },
  { key: 'bi', text: 'BI Oslo', value: 'BI' },
  { key: 'uio', text: 'UIO', value: 'UIO' },
  { key: 'uit', text: 'UIT', value: 'UIT' },
  { key: 'uib', text: 'UIB', value: 'UIB' },
  { key: 'other', text: 'Other', value: 'Other' },
]

const matchLocationOptions = [
  { key: 'oslo', text: 'Oslo', value: 'Oslo' },
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
              displayName: userData.displayName ? userData.displayName : '',
              photoURL: user.photoURL ? user.photoURL : '',
              age: userData.age ? userData.age : '',
              gender: userData.gender ? userData.gender : '',
              studyProgramme: userData.studyProgramme
                ? userData.studyProgramme
                : '',
              workplace: userData.workplace ? userData.workplace : '',
              budget: userData.budget ? userData.budget : 0,
              propertySize: userData.propertySize ? userData.propertySize : 0,
              newness: userData.newness ? userData.newness : 0,
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
      propertySize: value
    })
  }

  handleNewness = (e, value) => {
    e.preventDefault()
    this.setState({
      newness: value
    })
  }

  handleSubmit = () => {
    window.scrollTo(0, 0)
    this.setState({ formLoading: true })
    const answerVector = []
    for (let q = 0; q < 20; q += 1) {
      answerVector.push(this.state[`q${q + 1}`] - 3)
    }
    const propertyVector = [this.state.budget, this.state.propertySize, this.state.newness]
    const userData = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      studyProgramme: this.state.studyProgramme,
      budget: this.state.budget,
      propertySize: this.state.propertySize,
      newness: this.state.newness,
      workplace: this.state.workplace,
      workplaceLatLng: this.state.workplaceLatLng,
      university: this.state.university,
      matchLocation: this.state.matchLocation,
      readyToMatch: this.state.readyToMatch,
      tos: this.state.tos,
      uid: this.state.user.uid,
      photoURL: this.state.user.photoURL,
      answerVector,
      propertyVector
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

  handleSliderChange = (value, name) => {
    this.setState({
      [name]: value
    })
  }

  render() {
    console.log(this.state)
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
      this.handleSubmit()
      return (
        <Redirect
          push
          to={{
            pathname: '/matches',
            state: { redirectToMatch: true }
          }}
        />
      )
    }

    const {
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
      <div style={{
        backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
          // backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
          backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
          backgroundSize: 'cover',
          boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
          }}
      >


        <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
          <Segment raised className="you" loading={this.state.formLoading}>
            <Form
              success={formSuccess}
              onSubmit={this.handleSubmit}
            >
              <Grid columns="equal" stackable>
                <Grid.Column>
                  <Header as="h1">
                  My profile
                    <Header.Subheader>
                    Fill out the entire form to get better matches and see how you appear to other users on the right.
                    </Header.Subheader>
                  </Header>
                  <Form.Input
                    fluid
                    label="Name"
                    placeholder="Name"
                    name="displayName"
                    value={displayName}
                    onChange={this.handleChange}
                  />
                  <Form.Group widths="equal">
                    <Form.Input
                      fluid
                      label="Age"
                      placeholder="Age"
                      name="age"
                      value={age}
                      onChange={this.handleChange}
                    />
                    <Form.Select
                      fluid
                      style={{ zIndex: 65 }}
                      label="Gender"
                      options={genderOptions}
                      placeholder="Gender"
                      value={gender}
                      name="gender"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input
                      fluid
                      label="Study programme"
                      placeholder="Study programme"
                      name="studyProgramme"
                      value={studyProgramme}
                      onChange={this.handleChange}
                    />
                    <Form.Select
                      fluid
                      style={{ zIndex: 61 }}
                      label="University"
                      options={universityOptions}
                      placeholder="University"
                      value={university}
                      name="university"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Select
                    fluid
                    style={{ zIndex: 60 }}
                    label="Where are you moving to?(Currently only supports Oslo)"
                    options={matchLocationOptions}
                    placeholder="Område du vil bli matchet til"
                    value={matchLocation}
                    name="matchLocation"
                    onChange={this.handleChange}
                  />
                  <Form.Field required>
                    <label>Address of workplace(Please pick a location in Oslo)</label>
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
                    <label>What is your budget?</label>
                    <Button.Group widths={3} >
                      <Popup
                        trigger={<Button primary={this.state.budget === 1} onClick={e => this.handleBudget(e, 1)} >As cheap as possible</Button>}
                        content="Less than 6000 kr pr month pr person"
                      />
                      <Button.Or />
                      <Popup
                        trigger={<Button primary={this.state.budget === 3} onClick={e => this.handleBudget(e, 3)} >Flexible</Button>}
                        content="I can lean either way"
                      />
                      <Button.Or />
                      <Popup
                        trigger={<Button primary={this.state.budget === 5} onClick={e => this.handleBudget(e, 5)} >I want to live like a {gender === 'Male' ? 'King' : 'Queen'}</Button>}
                        content="More than 10 000 kr pr month pr person"
                      />
                    </Button.Group>
                  </Form.Field>
                  <Form.Field>
                    <label>Does size matter to you?</label>
                    <Button.Group widths={3} >
                      <Button primary={this.state.propertySize === 1} onClick={e => this.handleSize(e, 1)} >A cupboard under the stairs is fine</Button>
                      <Button.Or />
                      <Button primary={this.state.propertySize === 3} onClick={e => this.handleSize(e, 3)} >Flexible</Button>
                      <Button.Or />
                      <Button primary={this.state.propertySize === 5} onClick={e => this.handleSize(e, 5)} >I need space!</Button>
                    </Button.Group>
                  </Form.Field>
                  <Form.Field>
                    <label>Newness</label>
                    <Button.Group widths={3} >
                      <Button primary={this.state.newness === 1} onClick={e => this.handleNewness(e, 1)} >A fixer upper is fine with me</Button>
                      <Button.Or />
                      <Button primary={this.state.newness === 3} onClick={e => this.handleNewness(e, 3)} >Flexible</Button>
                      <Button.Or />
                      <Button primary={this.state.newness === 5} onClick={e => this.handleNewness(e, 5)} >Give me something brand new</Button>
                    </Button.Group>
                  </Form.Field>
                  <div>
                    <Form.Field>
                      <Checkbox
                        label="Agree to "
                        checked={tos}
                        onChange={() => this.setState({ tos: !this.state.tos })}
                      />
                      <Link to="/TOS" onClick={this.handleSubmit} > Terms of Service</Link>
                    </Form.Field>
                  </div>
                  <Form.Field>
                    <Checkbox
                      label="I'm ready to get matched!"
                      checked={readyToMatch}
                      onChange={() =>
                      this.setState({ readyToMatch: !this.state.readyToMatch })
                    }
                    />
                  </Form.Field>
                  <div>
                    <Button onClick={this.handleSubmit} type="submit">Save</Button>
                    <Button onClick={() => this.setState({ redirectToMatch: true })} >Go to match list</Button>
                  </div>
                </Grid.Column>
                <Grid.Column
                  style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                >
                  <MateCard
                    mate={{
                      photoURL: photoURL || personAvatar,
                      age: this.state.age,
                      displayName: this.state.displayName,
                      workplace: this.state.workplace,
                      studyProgramme: this.state.studyProgramme,
                      university: this.state.university,
                      gender: this.state.gender,
                      budget: this.state.budget,
                      propertySize: this.state.propertySize,
                      newness: this.state.newness,
                      matchLocation: this.state.matchLocation,
                    }}
                    similarityScore={100}
                  />

                </Grid.Column>
              </Grid>
              <Message success header="Profile updated" content="You're ready to match!" />
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
                  <Segment style={{ paddingTop: '5vh' }} >
                    {SOCIAL_HABBITS_QUESTIONES.map(question => (
                      <MatchingQuestion
                        key={question.key}
                        question={question}
                        handleSliderChange={this.handleSliderChange}
                        value={this.state[question.key]}
                      />
                ))}
                    <Label attached="top left">Strongly disagree</Label>
                    <Label attached="top right">Strongly agree</Label>
                  </Segment>
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment
                  style={{ minHeight: '35em' }}
                  loading={this.state.formLoading}
                >
                  <h1>Cleanliness</h1>
                  <Segment style={{ paddingTop: '5vh' }} >
                    {CLEANLINESS_QUESTIONES.map(question => (
                      <MatchingQuestion
                        key={question.key}
                        question={question}
                        handleSliderChange={this.handleSliderChange}
                        value={this.state[question.key]}
                      />
                ))}
                    <Label attached="top left">Strongly disagree</Label>
                    <Label attached="top right">Strongly agree</Label>
                  </Segment>
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
                  <Segment style={{ paddingTop: '5vh' }} >
                    {SOCIAL_OPENNESS_QUESTIONES.map(question => (
                      <MatchingQuestion
                        key={question.key}
                        question={question}
                        handleSliderChange={this.handleSliderChange}
                        value={this.state[question.key]}
                      />
                ))}
                    <Label attached="top left">Strongly disagree</Label>
                    <Label attached="top right">Strongly agree</Label>
                  </Segment>
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment
                  style={{ minHeight: '35em' }}
                  loading={this.state.formLoading}
                >
                  <h1>Social flexibility</h1>
                  <Segment style={{ paddingTop: '5vh' }} >
                    {SOCIAL_FLEXIBILITY_QUESTIONES.map(question => (
                      <MatchingQuestion
                        key={question.key}
                        question={question}
                        handleSliderChange={this.handleSliderChange}
                        value={this.state[question.key]}
                      />
                ))}
                    <Label attached="top left">Strongly disagree</Label>
                    <Label attached="top right">Strongly agree</Label>
                  </Segment>
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Segment>
                  <div>
                    <Button onClick={this.handleSubmit} type="submit">Save</Button>
                    <Button onClick={() => this.setState({ redirectToMatch: true })} >Go to match list</Button>
                  </div>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    )
  }
}

export default Profile
