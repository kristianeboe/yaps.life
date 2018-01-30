import React, { Component } from 'react'
import { Form, Segment, Container, Dropdown, TextArea, Message } from 'semantic-ui-react'
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import firebase from './firebase'
import PlacesAutocomplete, { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete'

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
      form_loading: false,
      form_success: false,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.extractUserFromState = this.extractUserFromState.bind(this);
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSelect(workplace) {
    this.setState({
      workplace,
      loading: true,
    })

    geocodeByAddress(workplace)
      .then(results => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        console.log('Success Yay', { lat, lng })
        this.setState({
          geocodeResults: this.renderGeocodeSuccess(lat, lng),
          loading: false,
        })
      })
      .catch(error => {
        console.log('Oh no!', error)
        this.setState({
          geocodeResults: null, //this.renderGeocodeFailure(error),
          loading: false,
        })
      })

  }

  extractUserFromState() {

    let user = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      gender: this.state.gender,
      age: this.state.age,
      field_of_study: this.state.field_of_study,
      university: this.state.university,
      workplace: this.state.workplace,
      field_of_work: this.state.field_of_work,
      linkedIn_id: this.state.linkedIn_id,
      preferences_apartment: this.state.preferences_apartment,
      preferences_roommates: this.state.preferences_roommates,
      max_rent: this.state.max_rent,
      other_requests: this.state.other_requests,
      geocodeResults: this.state.geocodeResults,
    }

    return user
  }

  handleSubmit = (event) => {
    this.setState({ loading: true })
    let user = this.extractUserFromState()

    if (firebase.auth().currentUser) {
      user['google_uid'] = firebase.auth().currentUser.uid
      user['photo_url'] = firebase.auth().currentUser.photoURL
      user['displayName'] = firebase.auth().currentUser.displayName
    }

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
        form_loading: false,
        form_success: true
      })
    });
  }

  render() {

    const inputProps = {
      name: 'workplace',
      placeholder: 'Where are you going to work?',
      value: this.state.workplace,
      onChange: (workplace) => {
        this.setState({
          workplace,
          geocodeResults: null,
        })
      },
    }

    const Footer = () => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px', }}>
        <div>
          <img
            src={require('./powered_by_google_default.png')}
            style={{ display: 'inline-block', width: '150px' }}
            alt="Powered by Google"
          />
        </div>
      </div>
    )

    const shouldFetchSuggestions = ({ value }) => value.length > 2

    return (
      <Segment inverted vertical id="register-section">
        <Container>
          <Form onSubmit={this.handleSubmit} inverted loading={this.state.form_loading} success={this.state.form_success}>
            <Form.Group widths='equal'>
              <Form.Input required label='First Name' placeholder='First Name' name='first_name' value={this.state.first_name} onChange={this.handleChange} />
              <Form.Input required label='Last Name' placeholder='Last Name' name='last_name' value={this.state.last_name} onChange={this.handleChange} />
            </Form.Group>
            <Form.Input required label='Email' placeholder='Email' name='email' value={this.state.email} onChange={this.handleChange} />
            <Form.Group widths='equal'>
              <Form.Select required label='Gender' placeholder='Gender' name='gender' value={this.state.gender} options={gender_options} onChange={this.handleChange} />
              <Form.Input required label='Age' placeholder='Age' name='age' value={this.state.age} onChange={this.handleChange} />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input label='Field of study' placeholder='Field of study' name='field_of_study' value={this.state.field_of_study} onChange={this.handleChange} />
              <Form.Input required label='University' placeholder='University' name='university' value={this.state.university} onChange={this.handleChange} />
            </Form.Group>


            <Form.Field required>
              <label>Workplace</label>
              <PlacesAutocomplete
                styles={{ root: { zIndex: 50 } }}
                inputProps={inputProps}
                renderFooter={Footer}
                onSelect={this.handleSelect}
                shouldFetchSuggestions={shouldFetchSuggestions}
                highlightFirstSuggestion
                options={{
                  types: ['establishment']
                }}
              />
            </Form.Field>


            <Form.Field>
              <label>Type of work</label>
              <Dropdown placeholder='Type of work' name='field_of_work' value={this.state.field_of_work} fluid multiple search selection options={type_of_work_options} onChange={this.handleChange} />
            </Form.Field>
            <Form.Field>
              <label>Interests</label>
              <Dropdown label='Interests' placeholder='Interests' name='preferences_apartment' value={this.state.preferences_apartment} fluid multiple search selection options={interests_options} onChange={this.handleChange} />
            </Form.Field>
            <Form.Field>
              <label>Roommate preferences</label>
              <Dropdown label='Roommates' placeholder='Roommates' name='preferences_roommates' value={this.state.preferences_roommates} fluid multiple search selection options={preferences_roommates_options} onChange={this.handleChange} />
            </Form.Field>
            <Form.Input required label='LinkedIn id' placeholder='LinkedIn id' name='linkedIn_id' value={this.state.linkedIn_id} onChange={this.handleChange} />
            <Form.Input label='Max rent' placeholder='Max rent' name='max_rent' value={this.state.max_rent} onChange={this.handleChange} />
            <TextArea label='Other notes' placeholder='Other requests, notes or concerns?' name='other_requests' value={this.state.other_requests} onChange={this.handleChange} />
            <Form.Checkbox required label='I agree to the Terms and Conditions' name='tos_checkbox' value={this.state.tos_checkbox} onChange={this.handleChange} />
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
