import React, { Component } from 'react'
import {
  Image,
  Progress,
  FormField,
  List,
  Container,
  Dropdown,
  Button,
  Menu,
  Icon,
  Sidebar,
  Segment,
  Header,
  Form,
  Grid,
  Checkbox,
  Message,
  Step,
  Label,
} from 'semantic-ui-react'

import MatchingQuestion from './MatchingQuestion'
import {
  SOCIAL_HABBITS_QUESTIONES,
  CLEANLINESS_QUESTIONES,
  SOCIAL_OPENNESS_QUESTIONES,
  SOCIAL_FLEXIBILITY_QUESTIONES,
} from './MatchingQuestions'
import { Redirect } from 'react-router-dom'
import firebase, { auth } from './firebase'

const genderOptions = [{ key: 'm', text: 'Gutt', value: 'Gutt' }, { key: 'f', text: 'Jente', value: 'Jente' }]

class Matching extends Component {
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
      university: '',
      activeIndex: 0,
      SOCIAL_HABBITS: {},
      CLEANLINESS: {},
      SOCIAL_OPENNESS: {},
      SOCIAL_FLEXIBILITY: {},
    }
  }

  handleSliderChange = (value, name, type) => {
    this.setState({
      [type]: { ...this.state[type], [name]: value },
    })
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      this.setState({ user })

      firebase
        .firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(doc => {
          const userData = doc.data()
          this.setState({
            formLoading: false,
            displayName: user.displayName ? user.displayName : '',
            photoURL: user.photoURL ? user.photoURL : '',
            age: userData.age ? userData.age : '',
            gender: userData.gender ? userData.gender : '',
            studyProgramme: userData.studyProgramme ? userData.studyProgramme : '',
            university: userData.university ? userData.university : '',
            SOCIAL_HABBITS: userData.SOCIAL_HABBITS ? userData.SOCIAL_HABBITS : {},
            CLEANLINESS: userData.CLEANLINESS ? userData.CLEANLINESS : {},
            SOCIAL_OPENNESS: userData.SOCIAL_OPENNESS ? userData.SOCIAL_OPENNESS : {},
            SOCIAL_FLEXIBILITY: userData.SOCIAL_FLEXIBILITY ? userData.SOCIAL_FLEXIBILITY : {},
          })
        })
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
      university: this.state.university,
      SOCIAL_HABBITS: this.state.SOCIAL_HABBITS,
      CLEANLINESS: this.state.CLEANLINESS,
      SOCIAL_OPENNESS: this.state.SOCIAL_OPENNESS,
      SOCIAL_FLEXIBILITY: this.state.SOCIAL_FLEXIBILITY,
    }

    firebase
      .firestore()
      .collection('users')
      .doc(this.state.user.uid)
      .set(userData)
      .then(() => this.setState({ formLoading: false, formSuccess: true }))
  }

  render() {
    console.log(this.state)
    const {
      user,
      formLoading,
      formSuccess,
      displayName,
      age,
      gender,
      studyProgramme,
      university,
      photoURL,
      activeIndex,
    } = this.state

    if (!user) {
      ;<Redirect push to="login" />
    }

    const paneNames = ['Social habbits', 'Cleanliness', 'Social openness', 'Social flexibility']

    return (
      <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
        <Segment raised className="you" loading={this.state.formLoading}>
          <Form loading={formLoading} success={formSuccess}>
            <Grid columns="equal" stackable>
              <Grid.Column>
                <h1>Her er deg i dag</h1>
                <Form.Input fluid label="Name" placeholder="Name" name="displayName" value={displayName} />
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
                <Form.Button onClick={this.handleSubmit}>Save</Form.Button>
              </Grid.Column>
              <Grid.Column
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image circular src={photoURL} size="medium" />
                {/* <Form.Button>{photoURL ? 'Change profile image' : 'Upload profile image'}</Form.Button> */}
              </Grid.Column>
            </Grid>
            <Message success header="Profil oppdatert" content="Chill!" />
          </Form>
        </Segment>

        <Grid stackable columns="equal">
          <Grid.Row>
            <Grid.Column>
              <Segment style={{ minHeight: '50vh' }} loading={this.state.formLoading}>
                <h1>Social habbits</h1>
                {SOCIAL_HABBITS_QUESTIONES.map(question => (
                  <MatchingQuestion
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    parentState={this.state}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment style={{ minHeight: '50vh' }} loading={this.state.formLoading}>
                <h1>Cleanliness</h1>
                {CLEANLINESS_QUESTIONES.map(question => (
                  <MatchingQuestion
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    parentState={this.state}
                    value={this.state['CLEANLINESS'][question.key]}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Segment style={{ minHeight: '50vh' }} loading={this.state.formLoading}>
                <h1>Social openness</h1>
                {SOCIAL_OPENNESS_QUESTIONES.map(question => (
                  <MatchingQuestion
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    parentState={this.state}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment style={{ minHeight: '50vh' }} loading={this.state.formLoading}>
                <h1>Social flexibility</h1>
                {SOCIAL_FLEXIBILITY_QUESTIONES.map(question => (
                  <MatchingQuestion
                    question={question}
                    handleSliderChange={this.handleSliderChange}
                    parentState={this.state}
                  />
                ))}
                <Label attached="bottom left">Strongly disagree</Label>
                <Label attached="bottom right">Strongly agree</Label>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* <Segment >
          <Progress percent={10} size="tiny" attached="top" />
          {panes[0]}
        </Segment>
        <Tab menu={{ fluid: true, vertical: true, tabular: 'left' }} panes={panes.map((pane, key) => ({ menuItem: paneNames[key], render: () => <Tab.Pane>{pane}</Tab.Pane> }))} /> */}
      </Container>
    )
  }
}

export default Matching
