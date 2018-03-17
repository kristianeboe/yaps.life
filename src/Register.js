import React, { Component } from 'react'
import { Form, Segment, Button, Container, Dropdown, TextArea, Message, Tab } from 'semantic-ui-react'
import firebase from './firebase'
import PlacesAutocomplete, { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete'
import Parallax from './Parallax';
import AppHeader from './AppHeader'
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';


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

const personality_options = [
  { key: 'OpenMinded', text: 'Open Minded', value: 'open minded' },
  { key: 'Spontaneous', text: 'Spontaneous', value: 'spontaneous' },
  { key: 'Crazy', text: 'Crazy', value: 'crazy' },
  { key: 'Social', text: 'Social', value: 'social' },
  { key: 'Outgoing', text: 'Outgoing', value: 'outgoing' },
  { key: 'Hardworking', text: 'Hardworking', value: 'hardworking' },
  { key: 'Active', text: 'Active', value: 'active' },
  { key: 'ShyFriendly', text: 'ShyFriendly', value: 'shyFriendly' },
  { key: 'Calm', text: 'Calm', value: 'calm' },
  { key: 'Fearless', text: 'Fearless', value: 'fearless' },
  { key: 'Funny', text: 'Funny', value: 'funny' },
  { key: 'Caring', text: 'Caring', value: 'caring' },
  { key: 'Positive', text: 'Positive', value: 'positive' },
  { key: 'Clumsy', text: 'Clumsy', value: 'clumsy' },
  { key: 'Smart', text: 'Smart', value: 'smart' },
  { key: 'Perfectionist', text: 'perfectionist', value: 'perfectionist' },
  { key: 'CuriousAdventurous', text: 'CuriousAdventurous', value: 'curiousAdventurous' },
  { key: 'Predictable', text: 'Predictable', value: 'predictable' },
  { key: 'Lazy', text: 'Lazy', value: 'lazy' },
  { key: 'Helpful', text: 'Helpful', value: 'helpful' },
  { key: 'Talkative', text: 'Talkative', value: 'talkative' },
  { key: 'Emotional', text: 'Emotional', value: 'emotional' },
  { key: 'Strict', text: 'Strict', value: 'strict' },
  { key: 'Worrying', text: 'Worrying', value: 'worrying' },
  { key: 'Organized', text: 'Organized', value: 'organized' },
  { key: 'Imaginative', text: 'Imaginative', value: 'imaginative' },
  { key: 'Energetic', text: 'Energetic', value: 'energetic' },
  { key: 'Responsible', text: 'Responsible', value: 'responsible' },
  { key: 'Sceptical', text: 'Sceptical', value: 'sceptical' },
]

const interests_options = [

  { key: 'Sport', text: 'Sport', value: 'sport' },
  { key: 'Travel', text: 'Travel', value: 'travel' },
  { key: 'Photo', text: 'Photo', value: 'photo' },
  { key: 'Fashion', text: 'Fashion', value: 'fashion' },
  { key: 'Dancing', text: 'Dancing', value: 'dancing' },
  { key: 'Training', text: 'Training', value: 'training' },
  { key: 'OutdoorLife', text: 'Outdoor Life', value: 'outdoor Life' },
  { key: 'Film', text: 'Film', value: 'film' },
  { key: 'TV', text: 'TV', value: 'tv' },
  { key: 'Series', text: 'Series', value: 'series' },
  { key: 'Books', text: 'Books', value: 'books' },
  { key: 'Computer', text: 'Computer', value: 'computer' },
  { key: 'ExtremeSport', text: 'Extreme Sport', value: 'extreme Sport' },
  { key: 'Politics', text: 'Politics', value: 'politics' },
  { key: 'Religion', text: 'Religion', value: 'religion' },
  { key: 'Wintersport', text: 'Wintersport', value: 'wintersport' },
  { key: 'Cars', text: 'Cars', value: 'cars' },
  { key: 'Food', text: 'Food', value: 'food' },
  { key: 'Entrepreneurship', text: 'Entrepreneurship', value: 'entrepreneurship' },
  { key: 'Shopping', text: 'Shopping', value: 'shopping' },
  { key: 'Gaming', text: 'Gaming', value: 'gaming' },
  { key: 'Football', text: 'Football', value: 'football' },
  { key: 'WaterSports', text: 'Water Sports', value: 'water Sports' },
  { key: 'Running', text: 'Running', value: 'running' },
  { key: 'Art', text: 'Art', value: 'art' },
  { key: 'Science', text: 'Science', value: 'science' },
  { key: 'Fitness', text: 'Fitness', value: 'fitness' },
  { key: 'Animals', text: 'Animals', value: 'animals' },
  { key: 'Environment', text: 'Environment', value: 'environment' },
  { key: 'MartialArts', text: 'Martial Arts', value: ',artial Arts' },
  { key: 'Theater', text: 'Theater', value: 'theater' },
  { key: 'Gambling', text: 'Gambling', value: 'gambling' },
  { key: 'MotorSports', text: 'Motor Sports', value: 'motor Sports' },
  { key: 'Cycling', text: 'Cycling', value: 'cycling' },
  { key: 'Chess', text: 'Chess', value: 'chess' },
  { key: 'Farming', text: 'Farming', value: 'farming' },
  { key: 'Basketball', text: 'Basketball', value: 'basketball' },
  { key: 'Volleyball', text: 'Volleyball', value: 'volleyball' },
  { key: 'Handball', text: 'Handball', value: 'handball' },
  { key: 'Golf', text: 'Golf', value: 'golf' },
  { key: 'Tennis', text: 'Tennis', value: 'tennis' },
  { key: 'History', text: 'History', value: 'history' },
  { key: 'AmericanFootball', text: 'American Football', value: 'american Football' },
  { key: 'Skateboard', text: 'Skateboard', value: 'skateboard' },
  { key: 'Design', text: 'Design', value: 'design' },
  { key: 'Climbing', text: 'Climbing', value: 'Climbing' },
  { key: 'Walking', text: 'Walking', value: 'Walking' },
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
      preferences_personality: [],
      preferences_interests: [],
      preferences_roommates: [],
      max_rent: '',
      other_requests: '',
      tos_checkbox: '',
      form_loading: false,
      form_success: false,
      activeIndex: 0,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleCompletion = this.handleCompletion.bind(this);
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
      preferences_personality: this.state.preferences_personality,
      preferences_interests: this.state.preferences_interests,
      preferences_roommates: this.state.preferences_roommates,
      max_rent: this.state.max_rent,
      other_requests: this.state.other_requests,
      geocodeResults: this.state.geocodeResults,
    }

    return user
  }

  handleCompletion = (event) => {
    this.setState({ form_loading: true })
    let user = this.extractUserFromState()

    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set(user, { merge: true }).then(() => {
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
        preferences_personality: [],
        preferences_interests: [],
        preferences_roommates: [],
        max_rent: '',
        other_requests: '',
        tos_checkbox: '',
        form_loading: false,
        form_success: true
      })
    });
  }

  handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex })


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
    const { activeIndex } = this.state

    const pane1 = (
      <Form onSubmit={() => (this.setState({ activeIndex: 1 }))} >
        <h1>First some info about you</h1>
        <Form.Group widths='equal'>
          <Form.Input required label='First Name' placeholder='First Name' name='first_name' value={this.state.first_name} onChange={this.handleChange} />
          <Form.Input required label='Last Name' placeholder='Last Name' name='last_name' value={this.state.last_name} onChange={this.handleChange} />
        </Form.Group>
        <Form.Input required label='Email' placeholder='Email' name='email' value={this.state.email} onChange={this.handleChange} />
        <Form.Group widths='equal'>
          <Form.Select required label='Gender' placeholder='Gender' name='gender' value={this.state.gender} options={gender_options} onChange={this.handleChange} />
          <Form.Input required label='Age' placeholder='Age' name='age' value={this.state.age} onChange={this.handleChange} />
        </Form.Group>
        {/* <Button onClick={() => (this.setState({ activeIndex: activeIndex + 1 }))}>Next section</Button> */}
        <Button type="submit" >Next section</Button>
      </Form>
    )
    const pane2 = (
      <Form onSubmit={() => (this.setState({ activeIndex: 2 }))}>
        <h1>Tell us about your education</h1>
        <Form.Group widths='equal'>
          <Form.Input label='Field of study' placeholder='Field of study' name='field_of_study' value={this.state.field_of_study} onChange={this.handleChange} />
          <Form.Input required label='University' placeholder='University' name='university' value={this.state.university} onChange={this.handleChange} />
        </Form.Group>
        <Button type="submit" >Next section</Button>
      </Form>
    )
    const pane3 = (
      <Form onSubmit={() => (this.setState({ activeIndex: 3 }))}>
        <h1>Where do you work and what do you do there?</h1>
        <p>If you're a student, fill in where you are going to work</p>
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
        <Button type="submit" >Next section</Button>
      </Form>
    )
    const pane4 = (
      <Form onSubmit={() => (this.setState({ activeIndex: 4 }))}>
        <h1>The most important part. What makes you, you? What are you looking for in a shared accommodation</h1>
        <Form.Field>
          <label>I am my Personality</label>
          <Dropdown label='Personality' placeholder='Personality' name='preferences_personality' value={this.state.preferences_personality} fluid multiple search selection options={personality_options} onChange={this.handleChange} />
        </Form.Field>
        <Form.Field>
          <label>I like my INTERESTS</label>
          <Dropdown label='Interests' placeholder='Interests' name='preferences_interests' value={this.state.preferences_interests} fluid multiple search selection options={interests_options} onChange={this.handleChange} />
        </Form.Field>
        <Form.Field>
          My habbits are my life
        </Form.Field>
        <Form.Field>
          <label>I want to live with people who are</label>
          <Dropdown label='Roommates' placeholder='Roommates' name='preferences_roommates' value={this.state.preferences_roommates} fluid multiple search selection options={preferences_roommates_options} onChange={this.handleChange} />
        </Form.Field>
        <Button type="submit" >Next section</Button>
      </Form>
    )

    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const Handle = Slider.Handle;
    const wrapperStyle = { width: 400, margin: 50 };

    const handle = (props) => {
      const { value, dragging, index, ...restProps } = props;
      return (
        <Tooltip
          prefixCls="rc-slider-tooltip"
          overlay={value}
          visible={dragging}
          placement="top"
          key={index}
        >
          <Handle value={value} {...restProps} />
        </Tooltip>
      );
    };

    const pane045 = (
      <Container>
        <div style={wrapperStyle}>
          <p>Slider with custom handle</p>
          <Slider min={0} max={6} defaultValue={3} handle={this.handle} />
        </div>
        <Button content="<Back" />
        <Button content="Continue" floated="right" />
      </Container>
    )

    const pane5 = (
      <Form loading={this.state.form_loading} success={this.state.form_success} onSubmit={this.handleCompletion} >
        <h1>Ok, last part</h1>
        <Form.Group>
          <Form.Input required label='LinkedIn id' placeholder='LinkedIn id' name='linkedIn_id' value={this.state.linkedIn_id} onChange={this.handleChange} />
          <Form.Input label='Max rent' placeholder='Max rent' name='max_rent' value={this.state.max_rent} onChange={this.handleChange} />
        </Form.Group>
        <TextArea label='Other notes' placeholder='Other requests, notes or concerns?' name='other_requests' value={this.state.other_requests} onChange={this.handleChange} />
        <Form.Checkbox required label='I agree to the Terms and Conditions' name='tos_checkbox' value={this.state.tos_checkbox} onChange={this.handleChange} />
        <Button type="submit" >Get matched now!</Button>
        <Message
          success
          header='Form Completed'
          content="You've been registered! We'll be in touch soon"
        />
      </Form>
    )
    const paneNames = ['About you', 'Education', 'Work', 'Preferences', 'Test', 'Submit']
    const panes = [pane1, pane2, pane3, pane4, pane045, pane5].map((pane, key) => ({ menuItem: paneNames[key], render: () => <Tab.Pane>{pane}</Tab.Pane> }))


    return (
      <div className="register_root">
        <AppHeader />
        <Parallax
          h1_content='Register'
          h3_content=''
          h2_content='Enter your info and meet your new flatmates'
          button_content=''
          backgroundImage='url("/assets/images/yap_landing_compressed.jpg")'
        />
        <Segment vertical id="register-section">
          <Container>
            {/* <Form loading={this.state.form_loading} success={this.state.form_success} > */}
            <Tab menu={{ fluid: true, vertical: true, tabular: 'left' }} activeIndex={activeIndex} onTabChange={this.handleTabChange} panes={panes} />
            {/* </Form> */}
          </Container>
        </Segment>
      </div>
    )
  }
}

export default Register
