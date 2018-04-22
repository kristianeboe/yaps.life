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
import PropertySegment from '../Containers/PropertySegment'
import LandlordCard from '../Containers/LandlordCard'

const numberOfBedroomsOptions = [
  { key: '1', text: '1', value: '1' },
  { key: '2', text: '2', value: '2' },
  { key: '3', text: '3', value: '3' },
  { key: '4', text: '4', value: '4' },
  { key: '5', text: '5', value: '5' },
  { key: '6', text: '6', value: '6' },
  { key: '7', text: '7', value: '7' },
]

const propertyTypeOptions = [
  { key: '1', text: 'Apartment', value: 'apartment' },
  { key: '2', text: 'House', value: 'House' },
  { key: '3', text: 'Villa', value: 'Villa' },

]

const matchLocationOptions = [
  { key: 'oslo', text: 'Oslo', value: 'Oslo' },
]


class UploadListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      formSuccess: false,
      title: '',
      numberOfBedrooms: '',
      pricePerRoom: '',
      matchLocation: '',
      propertyType: '',
      address: '',
      addressLatLng: {
        lat: '',
        lng: '',
      },
      budget: 0,
      propertySize: 0,
      standard: 0,
      style: 0,
      externalListingURL: '',
      tos: false,
      readyToMatch: false,
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = async () => {
    const listing = {
      title: this.state.title,
      numberOfBedrooms: this.state.numberOfBedrooms,
      pricePerRoom: this.state.pricePerRoom,
      matchLocation: this.state.matchLocation,
      address: this.state.address,
      propertyType: this.state.propertyType,
      addressLatLng: this.state.addressLatLng,
      propertyVector: [this.budgetFromPricePerRoom(this.state.pricePerRoom), this.state.propertySize, this.state.standard, this.state.style],
      externalListingURL: this.state.externalListingURL,
      ownerId: this.props.user.uid,
      readyToMatch: this.state.readyToMatch,
    }

    console.log(listing)

    const listingId = await firebase.firestore().collection('listings').add(listing)
  }

  budgetFromPricePerRoom = pricePerRoom => (pricePerRoom === '' ? 0 : pricePerRoom < 5000 ? 1 : pricePerRoom > 9000 ? 5 : 3)
  render() {
    const {
      formSuccess, title, numberOfBedrooms, pricePerRoom, matchLocation, tos, readyToMatch, externalListingURL
    } = this.state


    const budget = this.budgetFromPricePerRoom(pricePerRoom)
    console.log(this.state)
    console.log(this.props)

    return (
      <Segment raised className="you" loading={this.state.formLoading}>
        <Form
          success={formSuccess}
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
              <Form.Group widths="equal">
                <Form.Select
                  fluid
                  style={{ zIndex: 60 }}
                  label="Location of listing?"
                  options={matchLocationOptions}
                  placeholder="Location of listing"
                  value={matchLocation}
                  name="matchLocation"
                  onChange={this.handleChange}
                />
                <Form.Select
                  fluid
                  style={{ zIndex: 61 }}
                  label="Property type"
                  options={propertyTypeOptions}
                  placeholder="Property type"
                  value={numberOfBedrooms}
                  name="numberOfBedrooms"
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Field required>
                <label>Address of property</label>
                <PlacesAutocomplete
                  styles={{ root: { zIndex: 50 } }}
                  inputProps={{
                  name: 'address',
                  placeholder: 'Address of property',
                  value: this.state.address,
                  onChange: (address) => {
                    this.setState({
                      address
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
                  onSelect={(address) => {
                  this.setState({ address })
                  geocodeByAddress(address)
                    .then(results => getLatLng(results[0]))
                    .then(({ lat, lng }) => {
                      this.setState({
                        addressLatLng: {
                          lat,
                          lng
                        }
                      })
                    })
                    .catch((error) => {
                      console.log('Oh no!', error)
                      this.setState({
                        addressLatLng: null // this.renderGeocodeFailure(error),
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
                    trigger={<Button primary={budget === 1} >Relativly cheap</Button>}
                    content="Less than 6000 kr pr month pr person"
                  />
                  <Button.Or />
                  <Popup
                    trigger={<Button primary={budget === 3} >Medium</Button>}
                    content="I can lean either way"
                  />
                  <Button.Or />
                  <Popup
                    trigger={<Button primary={budget === 5} >This place is high end</Button>}
                    content="More than 10 000 kr pr month pr person"
                  />
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <label>Size of property</label>
                <Button.Group widths={3} >
                  <Button primary={this.state.propertySize === 1} onClick={e => this.handleChange(e, { name: 'propertySize', value: 1 })} >Quite small</Button>
                  <Button.Or />
                  <Button primary={this.state.propertySize === 3} onClick={e => this.handleChange(e, { name: 'propertySize', value: 1 })} >Standard</Button>
                  <Button.Or />
                  <Button primary={this.state.propertySize === 5} onClick={e => this.handleChange(e, { name: 'propertySize', value: 1 })} >Huge</Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <label>Standard</label>
                <Button.Group widths={3} >
                  <Button primary={this.state.standard === 1} onClick={e => this.handleChange(e, { name: 'standard', value: 1 })} >Could use a fresh stroke of paint</Button>
                  <Button.Or />
                  <Button primary={this.state.standard === 3} onClick={e => this.handleChange(e, { name: 'standard', value: 1 })} >Not old, but not new</Button>
                  <Button.Or />
                  <Button primary={this.state.standard === 5} onClick={e => this.handleChange(e, { name: 'standard', value: 1 })} >Good as new</Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <label>Style</label>
                <Button.Group widths={3} >
                  <Button name="style" primary={this.state.style === 1} onClick={e => this.handleChange(e, { name: 'style', value: 1 })} >Rustic</Button>
                  <Button.Or />
                  <Button name="style" primary={this.state.style === 3} onClick={e => this.handleChange(e, { name: 'style', value: 3 })} >Somewhere in the middle</Button>
                  <Button.Or />
                  <Button name="style" primary={this.state.style === 5} onClick={e => this.handleChange(e, { name: 'style', value: 5 })} >Modern</Button>
                </Button.Group>
              </Form.Field>
              <Form.Input
                fluid
                label="External listing link"
                placeholder="Link to external listings like Finn.no or AirBnB"
                name="externalListingURL"
                value={externalListingURL}
                onChange={this.handleChange}
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
                  label="Match this apartment with tenants"
                  checked={readyToMatch}
                  onChange={() =>
                  this.setState({ readyToMatch: !this.state.readyToMatch })
                }
                />
              </Form.Field>
              <Button onClick={this.handleSubmit} type="submit">Upload</Button>
            </Grid.Column>
            <Grid.Column
              style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            >
              <PropertySegment
                property={{
                  title: this.state.title,
                  pricePerRoom: 0,
                  address: this.state.address,
                  propertyVector: [this.state.budget, this.state.propertySize, this.state.style, this.state.standard],
                  matchLocation: this.state.matchLocation,
                  numberOfBedrooms: this.state.numberOfBedrooms,
                }}
                index={0}
              />
            </Grid.Column>
          </Grid>
          <Message success header="Profile updated" content="You're ready to match!" />
        </Form>
      </Segment>
    )
  }
}

export default UploadListing
