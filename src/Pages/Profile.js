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

import moment from 'moment'

import MatchingQuestion from '../Components/MatchingQuestion'
import {
  SOCIAL_HABBITS_QUESTIONES,
  CLEANLINESS_QUESTIONES,
  SOCIAL_OPENNESS_QUESTIONES,
  SOCIAL_FLEXIBILITY_QUESTIONES
} from '../assets/MatchingQuestions'
import { auth, firestore } from '../firebase'
import MateCard from '../Containers/MateCard'
import personAvatar from '../assets/images/personAvatar.png'
import PropertyVectorQuestions from '../Containers/PropertyVectorQuestions'
import ContactInfo from '../Containers/ContactInfo'
import PlacesAutoCompleteWrapper from '../Containers/PlacesAutoCompleteWrapper'
import RentFromDateRange from '../Containers/RentfromDateRange'
import { MATCH_LOCATION_OPTIONS } from '../utils/CONSTANTS'

const universityOptions = [
  { key: 'ntnu', text: 'NTNU', value: 'NTNU' },
  { key: 'nhh', text: 'NHH', value: 'NHH' },
  { key: 'bi', text: 'BI Oslo', value: 'BI' },
  { key: 'uio', text: 'UIO', value: 'UIO' },
  { key: 'uit', text: 'UIT', value: 'UIT' },
  { key: 'uib', text: 'UIB', value: 'UIB' },
  { key: 'other', text: 'Other', value: 'Other' },
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
      email: '',
      phone: '',
      studyProgramme: '',
      matchLocation: '',
      workplace: '',
      workplaceLatLng: {},
      budget: 0,
      university: '',
      ...questions,
      redirectToSignIn: false,
      readyToMatch: false,
      tos: false,
      landlord: false,
      rentFrom: moment('2018-06-01'),
      rentTo: moment('2018-08-31'),
      errors: {},
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
      if (user) {
        firestore
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
              standard: userData.standard ? userData.standard : 0,
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


  handleChange = (e, { name, value }) => {
    if (e) e.preventDefault()
    this.setState({ [name]: value })
  }


  handleSubmit = () => {
    window.scrollTo(0, 0)
    this.setState({ formLoading: true })
    const answerVector = []
    for (let q = 0; q < 20; q += 1) {
      answerVector.push(this.state[`q${q + 1}`] - 3)
    }
    const propertyVector = [this.state.budget, this.state.propertySize, this.state.standard]
    const userData = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      studyProgramme: this.state.studyProgramme,
      budget: this.state.budget,
      propertySize: this.state.propertySize,
      standard: this.state.standard,
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

    firestore
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

  handleDateChange = (name, date) => {
    this.setState({
      [name]: date
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
      errors,
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

    const {
      budget, propertySize, standard, style
    } = this.state

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
                  <ContactInfo
                    contactInfo={{
                        displayName, age, gender
                        }}
                    errors={errors}
                    handleChange={this.handleChange}
                  />
                  <Form.Group widths="equal">
                    <Form.Input
                      fluid
                      label="Study programme"
                      placeholder="Study programme"
                      name="studyProgramme"
                      value={this.state.studyProgramme}
                      onChange={this.handleChange}
                    />
                    <Form.Select
                      fluid
                      style={{ zIndex: 61 }}
                      label="University"
                      options={universityOptions}
                      placeholder="University"
                      value={this.state.university}
                      name="university"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Select
                    fluid
                    style={{ zIndex: 60 }}
                    label="Where are you moving to?(Currently only supports Oslo)"
                    options={MATCH_LOCATION_OPTIONS}
                    placeholder="Område du vil bli matchet til"
                    value={this.state.matchLocation}
                    name="matchLocation"
                    onChange={this.handleChange}
                  />
                  <Form.Field required>
                    <label>Address of workplace or university(Please pick a location in Oslo)</label>
                    <PlacesAutoCompleteWrapper
                      handleChange={this.handleChange}
                      fieldValue={this.state.workplace}
                    />
                  </Form.Field>
                  <RentFromDateRange
                    rentFrom={this.state.rentFrom}
                    rentTo={this.state.rentTo}
                    handleDateChange={this.handleDateChange}
                  />
                  <PropertyVectorQuestions
                    propertyVector={[budget, propertySize, standard, style]}
                    landlord={false}
                    handleChange={this.handleChange}
                  />
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
                  {/* <div>
                      <Button onClick={this.handleSubmit} type="submit">Save</Button>
                      <Button onClick={() => this.setState({ redirectToMatch: true })} >Go to match list</Button>
                      <Button onClick={() => this.setState({ landlord: true })} ><Link to="/landlord-view">Switch to Landlord view</Link></Button>
                    </div> */}
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
                      propertyVector: [this.state.budget, this.state.propertySize, this.state.standard],
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
                  <Segment style={{ paddingTop: '5vh' }}>
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
