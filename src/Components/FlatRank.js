import React, { Component } from 'react'
import { Form, Segment, Popup, Header, Divider, Input, Button } from 'semantic-ui-react'
import axios from 'axios'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import FlatList from '../Containers/FlatList'
import firebase from '../firebase'

const budgetOptions = [
  { key: '1', value: 1, text: 'Cheap' },
  { key: '2', value: 3, text: 'Medium' },
  { key: '3', value: 5, text: 'Premium' }
]

const propertySizeOptions = [
  { key: '1', value: 1, text: 'Small' },
  { key: '2', value: 3, text: 'Medium' },
  { key: '3', value: 5, text: 'Large' }
]

const standardOptions = [
  { key: '1', value: 1, text: 'Fixer upper' },
  { key: '2', value: 3, text: 'Medium' },
  { key: '3', value: 5, text: 'Good as new' },
]

class FlatRank extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      price: '',
      budget: 0,
      propertySize: 0,
      standard: 0,
      // flats: [{ address: 'Arnebråtveien 75D', price: 25000, score: 10 }],
      segmentLoading: false,
      finnListingURL: '',
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  mapPropScoreToPercentage = propScore => Math.floor((1 - (propScore / 48)) * 100)

  handleSubmit = () => {
    console.log('submit')

    const {
      address, price, budget, propertySize, standard, finnListingURL, apartmentMetaData
    } = this.state
    const { propertyList, flatmates, matchDoc } = this.props

    const propertyVector = [budget, propertySize, standard]
    const groupScore = this.mapPropScoreToPercentage(euclidianDistanceSquared(matchDoc.data().groupPropertyVector, propertyVector))
    console.log(groupScore)
    if (address.length < 1 || price.length < 1) {
      console.log('address or price too short')
      return
    }

    this.setState({
      // flats: [...this.state.flats, { address, price, score: 0 }],
      segmentLoading: true,
      address: '',
      price: '',
    })
    const data = {
      address,
      flatmates,
    }
    console.log(matchDoc.data())
    const url = 'https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartmentHTTPS'
    axios
      .post(url, data)
      .then((response) => {
        console.log(response)
        const { score } = response.data

        propertyList.push({
          address,
          price,
          commuteScore: score,
          groupScore,
          finnListingURL,
          apartmentMetaData,
        })
        return firebase.firestore().collection('matches').doc(matchDoc.id).update({
          propertyList
        })
      }).then(() => {
        this.setState({
          segmentLoading: false,
        })
      })
      .catch(err => console.log('Error in evaluating apartment axios', err))
  }

  handleGetFinnListingDetails = () => {
    let { finnListingURL } = this.state


    if (finnListingURL.length === 8) {
      finnListingURL = `https://www.finn.no/realestate/lettings/ad.html?finnkode=${finnListingURL}`
    } else if (finnListingURL.length < 20) {
      console.log('URL too short')
      return false
    }
    this.setState({
      segmentLoading: true
    })
    axios
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getListingDetailsHTTPS', { finnURL: finnListingURL })
      .then((response) => {
        console.log(response)
        console.log(response.data)
        const { address, price, primærrom } = response.data

        const pricePerRoom = price < 15000 ? price : Math.floor(price / this.props.flatmates.length)

        const propertySize = primærrom > 100 ? 5 : primærrom < 60 ? 1 : 3
        const budget = pricePerRoom > 12000 ? 5 : pricePerRoom < 7000 ? 1 : 3
        const standard = response.data.facilities.find(el => el === 'moderne') ? 5 : 'Could not determine'

        this.setState({
          segmentLoading: false,
          address,
          price,
          budget,
          propertySize,
          apartmentMetaData: response.data,
          standard
        })
        console.log(this.state)
      })
      .catch(err => console.log('Error in evaluating apartment axios', err))
  }

  render() {
    const {
      address, price, segmentLoading, budget, propertySize, standard
    } = this.state

    return (
      <Segment loading={segmentLoading} >
        <Header as="h3" dividing >
          2. Paste in a link to a listing
          <Header.Subheader>
          If it'sa Finn.no link you can try to get the contents of the listing by pressing get info
          </Header.Subheader>
        </Header>
        <Form>
          <Form.Group>
            <Popup
              trigger={<Form.Input width={12} onChange={this.handleChange} name="finnListingURL" placeholder="Paste in listing link" />}
              content="Example: https://www.finn.no/realestate/lettings/ad.html?finnkode=117756936 or simply 117756936"
            />
            <Form.Button width={4} onClick={this.handleGetFinnListingDetails}>Get info</Form.Button>
          </Form.Group>
        </Form>
        <Header as="h3" dividing >
          3. Make sure the information is correct and click evaluate
          <Header.Subheader>
          Enter information about potential flats here and evaluate them for the group.
          </Header.Subheader>
        </Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths="equal">
            <Popup
              trigger={<Form.Input
                value={address}
                name="address"
                fluid
                onChange={this.handleChange}
                label="Address of property"
                icon="home"
                iconPosition="left"
                placeholder="street, zip, city..."
              />}
              content="The address of your new home, example: Pilestredet 57, 0350 Oslo"
            />
            <Popup
              trigger={
                <Form.Input
                  value={price}
                  name="price"
                  fluid
                  onChange={this.handleChange}
                  label="Price"
                  icon="dollar"
                  iconPosition="left"
                  placeholder="Price of flat"
                />}
              content="Price of the property pr month"
            />
          </Form.Group>
          <Form.Group widths="equal">


            <Popup
              trigger={<Form.Select
                fluid
                label="Budget"
                options={budgetOptions}
                placeholder="Budget"
                value={budget}
                name="budget"
                onChange={this.handleChange}
              />}
              content="Budget is determined by the price of the flat divided by the number of flatmates in the match"
            />
            <Popup
              trigger={
                <Form.Select
                  fluid
                  label="Property size"
                  options={propertySizeOptions}
                  placeholder="Property size"
                  value={propertySize}
                  name="propertySize"
                  onChange={this.handleChange}
                />}
              content="Small < 80m^2, Large > 110m^2, otherwise Medium"
            />
            <Popup
              trigger={
                <Form.Select
                  fluid
                  label="Standard"
                  options={standardOptions}
                  placeholder="Standard"
                  value={standard}
                  name="standard"
                  onChange={this.handleChange}
                />}
              content="You'll have to fill in this manually. Sorry :O PS: Defaults to medium"
            />
          </Form.Group>
          <Form.Button>Evaluate</Form.Button>
        </Form>
      </Segment>
    )
  }
}

export default FlatRank
