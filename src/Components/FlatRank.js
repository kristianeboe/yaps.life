import React, { Component } from 'react'
import { Form, Segment, Popup, Header, Message } from 'semantic-ui-react'
import axios from 'axios'
import {
  geocodeByAddress,
  getLatLng
} from 'react-places-autocomplete'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import { firestore } from '../firebase'
import { EvaluateListingFormValidation } from '../utils/FormValidations'
import PlacesAutoCompleteWrapper from '../Containers/PlacesAutoCompleteWrapper'
import { BUDGET_OPTIONS, PROPERTY_SIZE_OPTIONS, STANDARD_OPTIONS, STYLE_OPTIONS } from '../utils/CONSTANTS'

const initialFormState = {
  address: '',
  addressLatLng: { lat: '', lng: '' },
  pricePerMonth: '',
  budget: '',
  propertySize: '',
  standard: '',
  style: '',
  listingURL: '',
  errors: {}
  // number of bedrooms
  // matchLocation
  //
}

class FlatRank extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...initialFormState,
      apartmentMetaData: {},
      evaluateListingLoading: false,
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  mapPropScoreToPercentage = propScore => Math.floor((1 - (propScore / 48)) * 100)

  handleSubmit = async () => {
    console.log('submit')

    this.setState({ evaluateListingLoading: true })
    const formFields = {
      address: this.state.address,
      addressLatLng: this.state.addressLatLng,
      pricePerMonth: this.state.pricePerMonth,
      pricePerRoom: this.state.pricePerMonth / 4,
      budget: this.state.budget,
      propertySize: this.state.propertySize,
      standard: this.state.propertySize,
      style: this.state.style,
      propertyVector: [this.state.budget, this.state.propertySize, this.state.standard, this.state.style],
      listingURL: this.state.listingURL,
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
      const error = EvaluateListingFormValidation[key] ? !EvaluateListingFormValidation[key](value) : false
      if (error) {
        errors[key] = true
        errorFlag = true
      }
    })

    console.log(errors)

    if (!errorFlag) {
      const listing = {
        ...formFields,
        apartmentMetaData: this.state.apartmentMetaData,
        ownerId: this.props.matchDoc.id,
      }
      // await firestore.collection('listings').doc(this.props.matchDoc.id).set(listing)

      // evalute listing
      const data = {
        listing,
        matchId: this.props.matchDoc.id
      }
      const url = 'https://us-central1-yaps-1496498804190.cloudfunctions.net/addListingToMatchHTTPS'
      const response = await axios.post(url, data)

      this.setState({
        evaluateListingSuccess: true, ...initialFormState, evaluateListingError: false, evaluateListingLoading: false
      })
    } else {
      this.setState({ errors, evaluateListingError: true, evaluateListingLoading: false })
    }
  }

  handleGetFinnListingDetails = () => {
    const { listingURL } = this.state

    if (!EvaluateListingFormValidation.listingURL(listingURL)) {
      this.setState({ errors: { ...this.state.errors, listingURL: true } })
      return false
    }

    this.setState({
      evaluateListingLoading: true,
      errors: { ...this.state.errors, listingURL: false }
    })

    axios
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getListingDetailsHTTPS', { listingURL })
      .then((response) => {
        console.log(response.data)
        const { address, pricePerMonth, propertyVector } = response.data

        // const pricePerRoom = price < 15000 ? price : Math.floor(price / this.props.flatmates.length)

        // const budget = pricePerRoom > 9000 ? 5 : pricePerRoom < 5500 ? 1 : 3
        // const standard = response.data.facilities.find(el => el === 'moderne') ? 5 : 'Could not determine'

        const [budget, propertySize, standard, style] = propertyVector
        this.setState({
          evaluateListingLoading: false,
          address,
          pricePerMonth,
          budget,
          propertySize,
          standard,
          style,
          apartmentMetaData: response.data,
        })
        console.log(this.state)
      })
      .catch(err => console.log('Error in getting listing details axios', err))
  }

  render() {
    const {
      evaluateListingLoading,
      errors,
      listingURL,
      address,
      pricePerMonth,
      budget,
      propertySize,
      standard,
      style,
    } = this.state

    return (
      <Segment loading={evaluateListingLoading} >
        <Header as="h3" dividing >
          2. Evaluate different listings for your group
          <Header.Subheader>
          If it's a listing from Finn.no you can try to get the info by pasting in the link and click get info
          </Header.Subheader>
        </Header>
        <Form
          success={this.state.evaluateListingSuccess}
          error={this.state.evaluateListingError}
        >
          <Form.Group>
            <Popup
              trigger={<Form.Input
                width={12}
                onChange={this.handleChange}
                name="listingURL"
                value={listingURL}
                placeholder="Paste in listing link"
                onBlur={() => this.setState({ errors: { ...errors, listingURL: !EvaluateListingFormValidation.listingURL(listingURL) } })}
                error={errors.listingURL}
              />}
              content="Example: https://www.finn.no/realestate/lettings/ad.html?finnkode=117756936 or simply 117756936"
            />
            <Form.Button width={4} onClick={this.handleGetFinnListingDetails}>Get info</Form.Button>
          </Form.Group>
        </Form>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Popup
              trigger={
                <Form.Field
                  width="8"
                  required
                  error={errors.address}
                >
                  <label>Address of property</label>
                  <PlacesAutoCompleteWrapper
                    handleChange={this.handleChange}
                    fieldValue={address}
                    landlord
                  />
                </Form.Field>
            }
              content="The address of your new home, example: Pilestredet 57, 0350 Oslo"
            />
            <Popup
              trigger={
                <Form.Input
                  width="4"
                  value={pricePerMonth}
                  name="pricePerMonth"
                  fluid
                  onChange={this.handleChange}
                  label="Price per month"
                  placeholder="Price of flat"
                  onBlur={() => this.setState({ errors: { ...errors, pricePerMonth: !EvaluateListingFormValidation.pricePerMonth(pricePerMonth) } })}
                  error={errors.pricePerMonth}
                />}
              content="Price of the property pr month"
            />
            <Popup
              trigger={
                <Form.Input
                  width="4"
                  value={pricePerMonth ? pricePerMonth / 4 : ''}
                  name="price"
                  fluid
                  readOnly
                  label="Per person"
                  placeholder="Per person"
                />}
              content="Calculated automatically based on price per month"
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Popup
              trigger={<Form.Select
                fluid
                label="Budget"
                options={BUDGET_OPTIONS}
                placeholder="Budget"
                value={budget}
                name="budget"
                onChange={this.handleChange}
                onBlur={() => this.setState({ errors: { ...errors, budget: !EvaluateListingFormValidation.budget(budget) } })}
                error={errors.budget}
              />}
              content="Budget is determined by the price of the flat divided by the number of flatmates in the match"
            />
            <Popup
              trigger={
                <Form.Select
                  fluid
                  label="Property size"
                  options={PROPERTY_SIZE_OPTIONS}
                  placeholder="Size"
                  value={propertySize}
                  name="propertySize"
                  onChange={this.handleChange}
                  onBlur={() => this.setState({ errors: { ...errors, propertySize: !EvaluateListingFormValidation.propertySize(propertySize) } })}
                  error={errors.propertySize}

                />}
              content="Small < 80m^2, Large > 110m^2, otherwise Medium"
            />
            <Popup
              trigger={
                <Form.Select
                  fluid
                  label="Standard"
                  options={STANDARD_OPTIONS}
                  placeholder="Standard"
                  value={standard}
                  name="standard"
                  onChange={this.handleChange}
                  error={errors.standard}
                  onBlur={() => this.setState({ errors: { ...errors, standard: !EvaluateListingFormValidation.standard(standard) } })}
                />}
              content="You'll have to fill in this manually. Sorry :O PS: Defaults to medium"
            />
            <Popup
              trigger={
                <Form.Select
                  fluid
                  label="Style"
                  options={STYLE_OPTIONS}
                  placeholder="Style"
                  value={style}
                  name="style"
                  onChange={this.handleChange}
                  error={errors.style}
                  onBlur={() => this.setState({ errors: { ...errors, style: !EvaluateListingFormValidation.style(style) } })}
                />}
              content="You'll have to fill in this manually. Sorry :O PS: Defaults to medium"
            />
          </Form.Group>
          <Form.Button>Evaluate</Form.Button>
          Make sure the information is correct and click evaluate
          <Message success header="Listing uploaded" content="It should appear in the list any second" />
          <Message
            error
            header="Upload unsuccessful"
            content={
              `Fix the errors in the form and try again\n${
              Object.keys(errors)}`
              }
          />
        </Form>
      </Segment>
    )
  }
}

export default FlatRank


{ /* <Form.Input
                value={address}
                name="address"
                fluid
                onChange={this.handleChange}
                label="Address of property"
                icon="home"
                iconPosition="left"
                placeholder="street, zip, city..."


              /> */ }

