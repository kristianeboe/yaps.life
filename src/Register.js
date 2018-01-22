import React, { Component } from 'react'
import { Form, Segment, Container, Dropdown, TextArea, Message } from 'semantic-ui-react'
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import firebase from './firebase'

const gender_options = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' },
  { key: 'o', text: 'Other', value: 'other' },
]

const type_of_work_options = [
  { key: 'c', text: 'Coding', value: 'coding' },
  { key: 's', text: 'Strategy', value: 'strategy' },
  { key: 'pm', text: 'Project management', value: 'project_management' },
  { key: 'f', text: 'Finance', value: 'finance' },
  { key: 'su', text: 'Startup', value: 'startup' },
  { key: 'd', text: 'Design', value: 'design' },
  { key: 'e', text: 'Engineering', value: 'engineering' },
  { key: 'o', text: 'Other', value: 'other' },
]

const interests_options = [
  { key: 'partying', text: 'Partying', value: 'partying' },
  { key: 'hacking', text: 'Hacking', value: 'hacking' },
  { key: 'sleeping', text: 'Sleeping', value: 'sleeping' },
  { key: 'quiet', text: 'Quiet', value: 'quiet' },
  { key: 'movie_nights', text: 'Movie nights', value: 'movie_nights' },
  { key: 'cleanliness', text: 'Cleanliness', value: 'cleanliness' },
  { key: 'working_out', text: 'Working out', value: 'working_out' },
]

const preferences_roommates_options = [
  { key: 'same_company', text: 'Same company', value: 'same_company' },
  { key: 'same_type_of_work', text: 'Same type of work', value: 'same_type_of_work' },
  { key: 'different_type_of_work', text: 'Different type of work', value: 'different_type_of_work' },
  { key: 'mixed', text: 'Mixed', value: 'mixed' },
]


class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      gender: '',
      age: '',
      field_of_study: '',
      university: '',
      workplace: '',
      field_of_work: [],
      linkedIn_id: '',
      preferences_apartment: [],
      preferences_roommates: [],
      max_rent: '',
      other_requests: '',
      tos_checkbox: '',
      loading: false,
      form_success: false,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = (event) => {
    this.setState({ loading: true })
    const user = this.state

    const collection = firebase.firestore().collection('users');
    collection.add(user).then(() => {
      this.setState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        age: '',
        field_of_study: '',
        university: '',
        workplace: '',
        field_of_work: [],
        linkedIn_id: '',
        preferences_apartment: [],
        preferences_roommates: [],
        max_rent: '',
        other_requests: '',
        tos_checkbox: '',
        loading: false,
        form_success: true
      })
    });
  }

  render() {
    const {
      first_name,
      last_name,
      email,
      gender,
      age,
      field_of_study,
      university,
      workplace,
      field_of_work,
      preferences_apartment,
      preferences_roommates,
      linkedIn_id,
      max_rent,
      other_requests,
      tos_checkbox,
      loading,
      form_success } = this.state

    return (
      <Segment inverted vertical id="register-section">
        <Container>
          <Form onSubmit={this.handleSubmit} inverted loading={loading} success={form_success}>
            <Form.Group widths='equal'>
              <Form.Input required label='First Name' placeholder='First Name' name='first_name' value={first_name} onChange={this.handleChange} />
              <Form.Input required label='Last Name' placeholder='Last Name' name='last_name' value={last_name} onChange={this.handleChange} />
            </Form.Group>
            <Form.Input required label='Email' placeholder='Email' name='email' value={email} onChange={this.handleChange} />
            <Form.Group widths='equal'>
              <Form.Select required label='Gender' placeholder='Gender' name='gender' value={gender} options={gender_options} onChange={this.handleChange} />
              <Form.Input required label='Age' placeholder='Age' name='age' value={age} onChange={this.handleChange} />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input label='Field of study' placeholder='Field of study' name='field_of_study' value={field_of_study} onChange={this.handleChange} />
              <Form.Input required label='University' placeholder='University' name='university' value={university} onChange={this.handleChange} />
            </Form.Group>
            <Form.Input label='Address of workplace' placeholder='Where are you going to work?' name='workplace' value={workplace} onChange={this.handleChange} />
            <label>Type of work</label>
            <Dropdown placeholder='Type of work' name='field_of_work' value={field_of_work} fluid multiple search selection options={type_of_work_options} onChange={this.handleChange} />
            <label>Interests</label>
            <Dropdown label='Interests' placeholder='Interests' name='preferences_apartment' value={preferences_apartment} fluid multiple search selection options={interests_options} onChange={this.handleChange} />
            <label>Roommate preferences</label>
            <Dropdown label='Roommates' placeholder='Roommates' name='preferences_roommates' value={preferences_roommates} fluid multiple search selection options={preferences_roommates_options} onChange={this.handleChange} />
            <Form.Input required label='LinkedIn id' placeholder='LinkedIn id' name='linkedIn_id' value={linkedIn_id} onChange={this.handleChange} />
            <Form.Input label='Max rent' placeholder='Max rent' name='max_rent' value={max_rent} onChange={this.handleChange} />
            <TextArea label='Other notes' placeholder='Other requests, notes or concerns?' name='other_requests' value={other_requests} onChange={this.handleChange} />
            <Form.Checkbox required label='I agree to the Terms and Conditions' name='tos_checkbox' value={tos_checkbox} onChange={this.handleChange} />
            <Button type="submit" >Submit</Button>
            <Message
              success
              header='Form Completed'
              content="You've been registered! We'll be in touch soon"
            />
          </Form>
        </Container>
      </Segment>
    )
  }
}

export default Register
