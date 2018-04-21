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
import firebase, { auth } from '../firebase'
import personAvatar from '../assets/images/personAvatar.png'
import PropertyCard from '../Containers/PropertyCard'

const numberOfBedroomsOptions = [
  { key: '1', text: '1', value: '1' },
  { key: '2', text: '2', value: '2' },
  { key: '3', text: '3', value: '3' },
  { key: '4', text: '4', value: '4' },
  { key: '5', text: '5', value: '5' },
  { key: '6', text: '6', value: '6' },
  { key: '7', text: '7', value: '7' },
]

const matchLocationOptions = [
  { key: 'oslo', text: 'Oslo', value: 'Oslo' },
]

class UploadProperty extends Component {
  constructor(props) {
    super(props)
    this.state = {
      formSuccess: false,
      title: '',
      budget: 0,
      propertySize: 0,
      newness: 0,
      style: 0,
      numberOfBedrooms: '',
      tos: false,
      readyToMatch: false,
      listings: []
    }
  }

  async componentDidMount() {
    auth.onAuthStateChanged(async (user) => {
      this.setState({ user })
      if (user) {
        const listingsSnapshot = await firebase.firestore().collection('users').doc(user.uid).collection('listings')
          .get()
        const listings = []
        listingsSnapshot.forEach(listing => listings.push(listing.data()))
        const fakeProp = {
          title: 'Penthouse på møllenberg',
          address: 'Wessels gate 22b',
          pricePrRoom: 5375,
          budget: 3,
          propertySize: 3,
          newness: 3,
          style: 3,
        }
        listings.push(fakeProp)
        this.setState({ listings })
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

  render() {
    const {
      formSuccess, title, numberOfBedrooms, pricePerRoom, matchLocation, tos, readyToMatch
    } = this.state
    console.log(this.state)


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
          <Grid>
            <Grid.Column width="10">
              <Segment>
                <Header>My Landlord profile</Header>
              </Segment>
            </Grid.Column>
            <Grid.Column width="6" >
              <Segment>
                <Header>My listings</Header>
                {this.state.listings.map(listing => <PropertyCard property={listing} />)}
              </Segment>
            </Grid.Column>
          </Grid>
          <Segment raised className="you" loading={this.state.formLoading}>
            <Form
              success={formSuccess}
              onSubmit={this.handleSubmit}
            >
              <Grid columns="equal" stackable>
                <Grid.Column>
                  <Header as="h1">
                      Upload property
                    <Header.Subheader>
                        Match your property with the perfect tenants
                    </Header.Subheader>
                  </Header>
                  <Form.Input
                    fluid
                    label="Header"
                    placeholder="Give your property a flashing header"
                    name="title"
                    value={title}
                    onChange={this.handleChange}
                  />
                  <Form.Group widths="equal">
                    <Form.Select
                      fluid
                      style={{ zIndex: 61 }}
                      label="Nr of bedrooms"
                      options={numberOfBedroomsOptions}
                      placeholder="Nr of bedrooms"
                      value={numberOfBedrooms}
                      name="numberOfBedrooms"
                      onChange={this.handleChange}
                    />
                    <Form.Input
                      fluid
                      label="Price per room"
                      placeholder="Price per room"
                      name="pricePerRoom"
                      value={pricePerRoom}
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
                    <label>Address of property</label>
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
                    <label>The budget for the apartment is determined by the price pr room</label>
                    <Button.Group widths={3} >
                      <Popup
                        trigger={<Button primary={this.state.budget === 1} onClick={e => this.handleBudget(e, 1)} >Relativly cheap</Button>}
                        content="Less than 6000 kr pr month pr person"
                      />
                      <Button.Or />
                      <Popup
                        trigger={<Button primary={this.state.budget === 3} onClick={e => this.handleBudget(e, 3)} >Medium</Button>}
                        content="I can lean either way"
                      />
                      <Button.Or />
                      <Popup
                        trigger={<Button primary={this.state.budget === 5} onClick={e => this.handleBudget(e, 5)} >This place is high end</Button>}
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
                  <Form.Field>
                    <label>Style</label>
                    <Button.Group widths={3} >
                      <Button name="style" primary={this.state.style === 1} onClick={e => this.handleChange(e, { name: 'style', value: 1 })} >A fixer upper is fine with me</Button>
                      <Button.Or />
                      <Button name="style" primary={this.state.style === 3} onClick={e => this.handleChange(e, { name: 'style', value: 3 })} >Flexible</Button>
                      <Button.Or />
                      <Button name="style" primary={this.state.style === 5} onClick={e => this.handleChange(e, { name: 'style', value: 5 })} >Give me something brand new</Button>
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
                  <PropertyCard
                    property={{
                        propertyVector: [this.state.budget, this.state.propertySize, this.state.newness],
                        matchLocation: this.state.matchLocation,
                    }}
                    similarityScore={100}
                  />

                </Grid.Column>
              </Grid>
              <Message success header="Profile updated" content="You're ready to match!" />
            </Form>
          </Segment>
        </Container>
      </div>
    )
  }
}

export default UploadProperty
