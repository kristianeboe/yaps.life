import React, { Component } from 'react'
import {
  Button,
  Segment,
  Form,
  Grid,
  Checkbox,
  Message,
  Popup,
  Header
} from 'semantic-ui-react'
import uuid from 'uuid'
import {
  geocodeByAddress,
  getLatLng
} from 'react-places-autocomplete'
import { Link } from 'react-router-dom'
import { firestore } from '../firebase'
import PropertySegment from '../Containers/PropertySegment'
import PropertyVectorQuestions from '../Containers/PropertyVectorQuestions'
import PlacesAutoCompleteWrapper from '../Containers/PlacesAutoCompleteWrapper'
import { MATCH_LOCATION_OPTIONS, PROPERTY_TYPE_OPTIONS } from '../utils/CONSTANTS'
import { UploadListingFormValidation } from '../utils/FormValidations'

const numberOfBedroomsOptions = [
  { key: '1', text: '1', value: 1 },
  { key: '2', text: '2', value: 2 },
  { key: '3', text: '3', value: 3 },
  { key: '4', text: '4', value: 4 },
  { key: '5', text: '5', value: 5 },
  { key: '6', text: '6', value: 6 },
  { key: '7', text: '7', value: 7 },
]

const initialFormState = {
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
  listingURL: '',
  tos: false,
  readyToMatch: false,
  errors: {},
}

class UploadListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uploadListingSuccess: false,
      uploadFormLoading: false,
      ...initialFormState
    }
  }

  handleChange = (e, { name, value }) => {
    if (e) e.preventDefault()
    this.setState({ [name]: value })
  }

  handleSubmit = async () => {
    this.setState({ uploadFormLoading: true })
    const uid = uuid.v4()
    const formFields = {
      title: this.state.title,
      numberOfBedrooms: this.state.numberOfBedrooms,
      pricePerRoom: this.state.pricePerRoom,
      propertyType: this.state.propertyType,
      matchLocation: this.state.matchLocation,
      address: this.state.address,
      propertyVector: [this.budgetFromPricePerRoom(this.state.pricePerRoom), this.state.propertySize, this.state.standard, this.state.style],
      addressLatLng: this.state.addressLatLng,
      listingURL: this.state.listingURL, // ? this.state.listingURL : uid,
      tos: this.state.tos,
    }

    if (formFields.address && (!formFields.addressLatLng.lat || !formFields.addressLatLng.lng)) {
      await geocodeByAddress(formFields.address).then(results => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          this.handleChange(null, {
            name: 'addressLatLng',
            value: { lat, lng }
          })
        })
    }

    const errors = {}
    let errorFlag = false
    Object.keys(formFields).forEach((key) => {
      const value = formFields[key]
      const error = UploadListingFormValidation[key] ? !UploadListingFormValidation[key](value) : false
      if (error) {
        errors[key] = true
        errorFlag = true
      }
    })

    if (!errorFlag) {
      const listing = {
        ...formFields,
        uid,
        ownerId: this.props.user.uid,
        readyToMatch: this.state.readyToMatch,
      }
      await firestore.collection('listings').doc(uid).set(listing)
      this.setState({
        uploadListingSuccess: true, ...initialFormState, uploadListingError: false, uploadFormLoading: false
      })
    } else {
      this.setState({ errors, uploadListingError: true, uploadFormLoading: false })
    }
  }

  budgetFromPricePerRoom = pricePerRoom => (pricePerRoom === '' ? 0 : pricePerRoom < 5000 ? 1 : pricePerRoom > 9000 ? 5 : 3)
  render() {
    const {
      uploadListingSuccess, uploadListingError, title, numberOfBedrooms, pricePerRoom, matchLocation, propertyType, tos, readyToMatch, listingURL, propertySize, standard, style, errors
    } = this.state

    const budget = this.budgetFromPricePerRoom(pricePerRoom)


    return (
      <Segment raised className="you" loading={this.state.uploadFormLoading}>
        <Grid columns="equal" stackable>
          <Grid.Column>
            <Header as="h1">
              Upload property
              <Header.Subheader>
                Match your property with the perfect tenants
              </Header.Subheader>
            </Header>
            <Form
              success={uploadListingSuccess}
              error={uploadListingError}
            >
              <Form.Input
                required
                fluid
                label="Header"
                placeholder="Give your property a flashing header"
                name="title"
                value={title}
                onBlur={() => this.setState({ errors: { ...errors, title: !UploadListingFormValidation.title(title) } })}
                onChange={this.handleChange}
                error={errors.title}
              />
              <Form.Group widths="equal">
                <Form.Select
                  required
                  fluid
                  style={{ zIndex: 61 }}
                  label="Nr of bedrooms"
                  options={numberOfBedroomsOptions}
                  placeholder="Nr of bedrooms"
                  value={numberOfBedrooms}
                  name="numberOfBedrooms"
                  onChange={this.handleChange}
                  onBlur={() => this.setState({ errors: { ...errors, numberOfBedrooms: !UploadListingFormValidation.numberOfBedrooms(numberOfBedrooms) } })}
                  error={errors.numberOfBedrooms}
                />
                <Form.Input
                  required
                  fluid
                  label="Price per room"
                  placeholder="Price per room"
                  name="pricePerRoom"
                  value={pricePerRoom}
                  onChange={this.handleChange}
                  onBlur={() => this.setState({ errors: { ...errors, pricePerRoom: !UploadListingFormValidation.pricePerRoom(pricePerRoom) } })}
                  error={errors.pricePerRoom}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Select
                  fluid
                  required
                  style={{ zIndex: 60 }}
                  label="Location of listing?"
                  options={MATCH_LOCATION_OPTIONS}
                  placeholder="Location of listing"
                  value={matchLocation}
                  name="matchLocation"
                  onChange={this.handleChange}
                  onBlur={() => this.setState({ errors: { ...errors, matchLocation: !UploadListingFormValidation.matchLocation(matchLocation) } })}
                  error={errors.matchLocation}
                />
                <Form.Select
                  fluid
                  required
                  style={{ zIndex: 61 }}
                  label="Property type"
                  options={PROPERTY_TYPE_OPTIONS}
                  placeholder="Property type"
                  value={propertyType}
                  name="propertyType"
                  onChange={this.handleChange}
                  onBlur={() => this.setState({ errors: { ...errors, propertyType: !UploadListingFormValidation.propertyType(propertyType) } })}
                  error={errors.propertyType}
                />
              </Form.Group>
              <Form.Field required error={errors.address} >
                <label>Address of property(Please pick a location in Oslo)</label>
                <PlacesAutoCompleteWrapper
                  handleChange={this.handleChange}
                  fieldValue={this.state.address}
                  landlord
                />
              </Form.Field>
              <PropertyVectorQuestions
                propertyVector={[budget, propertySize, standard, style]}
                landlord
                handleChange={this.handleChange}
              />
              <Form.Input
                fluid
                type="url"
                label="External listing link"
                placeholder="Link to external listings like Finn.no or AirBnB"
                name="listingURL"
                value={listingURL}
                onBlur={() => this.setState({ errors: { ...errors, listingURL: !UploadListingFormValidation.listingURL(listingURL) } })}
                onChange={this.handleChange}
                error={errors.listingURL}
              />
              <div>
                <Form.Field >
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
              <Message success header="Listing uploaded" content="Prepare to find your perfect tenants!" />
              <Message
                error
                header="Upload unsuccessful"
                content={
                `Fix the errors in the form and try again\n${
                Object.keys(errors)}`
                }
              />
            </Form>
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
                  pricePerRoom: this.state.pricePerRoom,
                  address: this.state.address,
                  propertyVector: [budget, this.state.propertySize, this.state.style, this.state.standard],
                  matchLocation: this.state.matchLocation,
                  numberOfBedrooms: this.state.numberOfBedrooms,
                  listingURL: this.state.listingURL
                }}
            />
          </Grid.Column>
        </Grid>
      </Segment>
    )
  }
}

export default UploadListing
