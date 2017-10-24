import React, { Component } from 'react'
import { Form, Segment, Container, Dropdown, TextArea} from 'semantic-ui-react'


const gender = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' },
  { key: 'o', text: 'Other', value: 'other' },
]

const type_of_work = [
  { key: 'c', text: 'Coding', value: 'coding' },
  { key: 's', text: 'Strategy', value: 'strategy' },
  { key: 'pm', text: 'Project management', value: 'project_management' },
  { key: 'f', text: 'Finance', value: 'finance' },
  { key: 'su', text: 'Startup', value: 'startup' },
  { key: 'd', text: 'Design', value: 'design' },
  { key: 'e', text: 'Engineering', value: 'engineering' },
  { key: 'o', text: 'Other', value: 'other' },
]

const interests = [
  { key: 'partying', text: 'Partying', value: 'partying' },
  { key: 'hacking', text: 'Hacking', value: 'hacking' },
  { key: 'sleeping', text: 'Sleeping', value: 'sleeping' },
  { key: 'quiet', text: 'Quiet', value: 'quiet' },
  { key: 'movie_nights', text: 'Movie nights', value: 'movie_nights' },
  { key: 'cleanliness', text: 'Cleanliness', value: 'cleanliness' },
  { key: 'working_out', text: 'Working out', value: 'working_out' },
]

const preferences_roommates = [
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
      field_of_study:'',
      university:'',
      workplace:'',
      field_of_work: [],
      linkedIn_id: '',
      preferences_apartment: [],
      preferences_roommates: [],
      max_rent: '',
      other_requests: '',
      submittedName: '', 
      submittedEmail: '',
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = (event) => {
    const { name, email } = this.state

    this.setState({ submittedName: name, submittedEmail: email })
  }

  render() {
    const { name, email, submittedName, submittedEmail, sex} = this.state
    return (
      <div>
        <Segment inverted>
          <Container>
            <Form onSubmit={this.handleSubmit} inverted>
              <Form.Group>
                <Form.Input label='First name' placeholder='First Name' width={8} name='first_name' onChange={this.handleChange} />
                <Form.Input label='Last Name' placeholder='Last Name' width={8} name='last_name' onChange={this.handleChange} />
              </Form.Group>
              <Form.Input placeholder='Email' name='email' onChange={this.handleChange} />
              <Form.Group>
                <Form.Select name='gender' options={gender} placeholder='Gender' onChange={this.onChange} width={8}/>
                <Form.Input placeholder='Age' name='age' onChange={this.handleChange} width={8}/>
              </Form.Group>
              <Form.Group>
                <Form.Input placeholder='Field of study' name='field_of_study' onChange={this.handleChange} width={8}/>
                <Form.Input placeholder='University' name='university' onChange={this.handleChange} width={8}/>
              </Form.Group>
              <Form.Input placeholder='Where are you going to work?' name='workplace' onChange={this.handleChange} />
              <Dropdown name='field_of_work' placeholder="Type of work" fluid multiple search selection options={type_of_work} onChange={this.handleChange}/>
              <Dropdown name='preferences_apartment' placeholder='Interests' fluid multiple search selection options={interests} />
              <Dropdown name='preferences_roommates' placeholder='Roommates' fluid multiple search selection options={preferences_roommates} />
              <Form.Input placeholder='LinkedIn id' name='linkedIn_id' onChange={this.handleChange} />
              <TextArea placeholder='Other requests, notes or concerns?' name='other_requests'/>
            </Form>
          </Container>
        </Segment>
      </div>
    )
  }
}

export default Register
