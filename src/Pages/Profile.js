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
  Header,
  Dropdown
} from 'semantic-ui-react'
import { Redirect, Link } from 'react-router-dom'

import moment from 'moment'

import MatchingQuestion from '../Components/MatchingQuestion'
import {
  SOCIAL_HABITS_QUESTIONS,
  CLEANLINESS_QUESTIONS,
  SOCIAL_OPENNESS_QUESTIONS,
  SOCIAL_FLEXIBILITY_QUESTIONS
} from '../assets/MatchingQuestions'
import { ProfileFormValidation } from '../utils/FormValidations'
import { auth, firestore } from '../firebase'
import MateCard from '../Containers/MateCard'
import personAvatar from '../assets/images/personAvatar.png'
import PropertyVectorQuestions from '../Containers/PropertyVectorQuestions'
import ContactInfo from '../Containers/ContactInfo'
import PlacesAutoCompleteWrapper from '../Containers/PlacesAutoCompleteWrapper'
import RentFromDateRange from '../Containers/RentfromDateRange'
import { MATCH_LOCATION_OPTIONS, UNIVERSITY_OPTIONS, FIELD_OF_STUDY_OPTIONS } from '../utils/CONSTANTS'


class Profile extends Component {
  constructor(props) {
    super(props)

    const questions = {}
    const personalityVector = new Array(20).fill(3)
    for (let index = 0; index < personalityVector.length; index += 1) {
      const answer = personalityVector[index]
      questions[`q${index + 1}`] = answer
    }
    this.state = {
      user: null,
      profileFormLoading: true,
      profileFormSuccess: false,
      displayName: '',
      photoURL: '',
      age: '',
      gender: '',
      email: '',
      phone: '',
      fieldOfStudy: '',
      fieldOfStudyOptions: FIELD_OF_STUDY_OPTIONS,
      matchLocation: '',
      workplace: '',
      workplaceLatLng: {},
      university: '',
      universityOptions: UNIVERSITY_OPTIONS,
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
            const { personalityVector, propertyVector } = userData

            for (let index = 0; index < personalityVector.length; index += 1) {
              const answer = personalityVector[index]
              questions[`q${index + 1}`] = answer + 3
            }
            const [budget, propertySize, standard, style] = propertyVector
            console.log(propertyVector)
            this.setState({
              profileFormLoading: false,
              displayName: userData.displayName ? userData.displayName : '',
              photoURL: userData.photoURL ? userData.photoURL : '',
              age: userData.age ? userData.age : '',
              gender: userData.gender ? userData.gender : '',
              fieldOfStudy: userData.fieldOfStudy
                ? userData.fieldOfStudy
                : '',
              workplace: userData.workplace ? userData.workplace : '',
              rentFrom: userData.rentFrom ? moment(userData.rentFrom) : moment('2018-06-01'),
              rentTo: userData.rentTo ? moment(userData.rentTo) : moment('2018-08-31'),
              budget,
              propertySize,
              standard,
              style,
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

  handleAddition = (e, { options, value }) => {
    this.setState({
      [options]: [{ text: value, value, key: value }, ...this.state[options]],
    })
  }


  handleSubmit = async () => {
    window.scrollTo(0, 0)
    this.setState({ profileFormLoading: true })
    const personalityVector = []
    for (let q = 0; q < 20; q += 1) {
      personalityVector.push(this.state[`q${q + 1}`] - 3)
    }

    const formFields = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      fieldOfStudy: this.state.fieldOfStudy,
      university: this.state.university,
      matchLocation: this.state.matchLocation,
      workplace: this.state.workplace,
      workplaceLatLng: this.state.workplaceLatLng,
      rentFrom: this.state.rentFrom.toISOString(),
      rentTo: this.state.rentTo.toISOString(),
      propertyVector: [this.state.budget, this.state.propertySize, this.state.standard, this.state.style],
      tos: this.state.tos,
      readyToMatch: this.state.readyToMatch,
      personalityVector,
    }

    const errors = {}
    let errorFlag = false
    Object.keys(formFields).forEach((key) => {
      const value = formFields[key]
      if (!ProfileFormValidation[key](value)) {
        errors[key] = true
        errorFlag = true
      }
    })
    if (!errorFlag) {
      const userData = {
        ...formFields,
        uid: this.state.user.uid,
        photoURL: this.state.photoURL,
      }

      await firestore.collection('users').doc(this.state.user.uid).set(userData, { merge: true })
      this.setState({ profileFormLoading: false, profileFormSuccess: true, profileFormError: false })
    } else {
      this.setState({ profileFormLoading: false, profileFormError: true, errors, })
    }
  }

  handleSliderChange = (value, name) => {
    this.setState({
      [name]: value
    })
  }

  handleDateChange = (name, date) => {
    const rentFromError = name === 'rentFrom' && date.isAfter(this.state.rentTo)
    const rentToError = name === 'rentTo' && date.isBefore(this.state.rentFrom)
    this.setState({
      [name]: date,
      dateError: (rentFromError || rentToError)
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
      profileFormSuccess,
      profileFormError,
      errors,
      displayName,
      age,
      gender,
      fieldOfStudy,
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
          <Segment raised className="you" loading={this.state.profileFormLoading}>
            <Form
              success={profileFormSuccess}
              error={profileFormError}
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
                    <Form.Select
                      fluid
                      style={{ zIndex: 62 }}
                      label="Field of study"
                      options={this.state.fieldOfStudyOptions}
                      placeholder="Field of study"
                      value={this.state.fieldOfStudy}
                      name="fieldOfStudy"
                      onChange={this.handleChange}
                      search
                      selection
                      allowAdditions
                      onAddItem={e => this.handleAddition(e, { options: 'fieldOfStudyOptions', value: this.state.fieldOfStudy })}
                    />
                    <Form.Select
                      style={{ zIndex: 61 }}
                      fluid
                      search
                      selection
                      allowAdditions
                      onAddItem={e => this.handleAddition(e, { options: 'universityOptions', value: this.state.university })}
                      name="university"
                      label="University"
                      placeholder="University"
                      options={this.state.universityOptions}
                      value={this.state.university}
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Select
                    fluid
                    style={{ zIndex: 60 }}
                    label="Where are you moving to? (Currently only supports Oslo)"
                    options={MATCH_LOCATION_OPTIONS}
                    placeholder="Område du vil bli matchet til"
                    value={this.state.matchLocation}
                    name="matchLocation"
                    onChange={this.handleChange}
                  />
                  <Form.Field required>
                    <label>Address of workplace or university (Please pick a location in Oslo)</label>
                    <PlacesAutoCompleteWrapper
                      handleChange={this.handleChange}
                      fieldValue={this.state.workplace}
                    />
                  </Form.Field>
                  {/* <Form.Group> // what will you work with?
                    <Form.Select
                      style={{ zIndex: 61 }}
                      fluid
                      search
                      selection
                      allowAdditions
                      onAddItem={e => this.handleAddition(e, { options: 'universityOptions', value: this.state.university })}
                      name="university"
                      label="University"
                      placeholder="University"
                      options={this.state.universityOptions}
                      value={this.state.university}
                      onChange={this.handleChange}
                    />
                    <Form.Select
                      style={{ zIndex: 61 }}
                      fluid
                      search
                      selection
                      allowAdditions
                      onAddItem={e => this.handleAddition(e, { options: 'universityOptions', value: this.state.university })}
                      name="university"
                      label="University"
                      placeholder="University"
                      options={this.state.universityOptions}
                      value={this.state.university}
                      onChange={this.handleChange}
                    />
                  </Form.Group> */}
                  <RentFromDateRange
                    rentFrom={this.state.rentFrom}
                    rentTo={this.state.rentTo}
                    handleDateChange={this.handleDateChange}
                    dateError={this.state.dateError}
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
                      fieldOfStudy: this.state.fieldOfStudy,
                      university: this.state.university,
                      gender: this.state.gender,
                      propertyVector: [this.state.budget, this.state.propertySize, this.state.standard],
                      matchLocation: this.state.matchLocation,
                    }}
                    similarityScore={100}
                  />

                </Grid.Column>
              </Grid>
              <Message
                success
                header="Profile updated"
                content={
                  <div>
                    You're ready to match! <Link to="matches" >Go to match list</Link>
                  </div>
                }
              />
              <Message
                error
                header="Profile not updated"
                content={
                  `Fix the errors in the form and try again\n
                  ${Object.keys(errors)}`
                }
              />
            </Form>
          </Segment>

          <Grid stackable columns="equal">
            <Grid.Row>
              <Grid.Column>
                <Segment
                  style={{ minHeight: '35em' }}
                  loading={this.state.profileFormLoading}
                >
                  <h1>Social habits</h1>
                  <Segment style={{ paddingTop: '5vh' }} >
                    {SOCIAL_HABITS_QUESTIONS.map(question => (
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
                  loading={this.state.profileFormLoading}
                >
                  <h1>Cleanliness</h1>
                  <Segment style={{ paddingTop: '5vh' }}>
                    {CLEANLINESS_QUESTIONS.map(question => (
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
                  loading={this.state.profileFormLoading}
                >
                  <h1>Social openness</h1>
                  <Segment style={{ paddingTop: '5vh' }} >
                    {SOCIAL_OPENNESS_QUESTIONS.map(question => (
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
                  loading={this.state.profileFormLoading}
                >
                  <h1>Social flexibility</h1>
                  <Segment style={{ paddingTop: '5vh' }} >
                    {SOCIAL_FLEXIBILITY_QUESTIONS.map(question => (
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
                    <Button onClick={() => {
                      this.handleSubmit()
                      this.setState({ redirectToMatch: true })
                      }}
                    >Go to match list
                    </Button>
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
