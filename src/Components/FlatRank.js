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

const newnessOptions = [
  { key: '1', value: 1, text: 'Old' },
  { key: '2', value: 3, text: 'Refurbished' },
  { key: '3', value: 5, text: 'Brand new' },
]

class FlatRank extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      price: '',
      budget: 0,
      propertySize: 0,
      newness: 0,
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
      address, price, budget, propertySize, newness, finnListingURL, apartmentMetaData
    } = this.state
    const { propertyList, flatmates, matchDoc } = this.props

    const propertyVector = [budget, propertySize, newness]
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
    const url = 'https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment'
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
      .post('https://us-central1-yaps-1496498804190.cloudfunctions.net/getListingDetails', { finnURL: finnListingURL })
      .then((response) => {
        console.log(response)
        console.log(response.data)
        const { address, price, primærrom } = response.data

        const pricePerPerson = price < 15000 ? price : Math.floor(price / this.props.flatmates.length)

        const propertySize = primærrom > 100 ? 5 : primærrom < 60 ? 1 : 3
        const budget = pricePerPerson > 12000 ? 5 : pricePerPerson < 7000 ? 1 : 3
        const newness = response.data.facilities.find(el => el === 'moderne') ? 5 : 'Could not determine'

        this.setState({
          segmentLoading: false,
          address,
          price,
          budget,
          propertySize,
          apartmentMetaData: response.data,
          newness
        })
        console.log(this.state)
      })
      .catch(err => console.log('Error in evaluating apartment axios', err))
  }

  render() {
    const {
      address, price, segmentLoading, budget, propertySize, newness
    } = this.state

    return (
      <Segment loading={segmentLoading} >
        <Header as="h3" dividing >
          2. Evaluate options
          <Header.Subheader>
          Enter information about potential flats here and evaluate them for the group.
          </Header.Subheader>
        </Header>
        <Form>
          <Form.Group>
            <Popup
              trigger={<Form.Input width={12} onChange={this.handleChange} name="finnListingURL" placeholder="Pase in Finn.no apartment link or finn code" />}
              content="Example: https://www.finn.no/realestate/lettings/ad.html?finnkode=117756936 or simply 117756936"
            />
            <Form.Button width={4} onClick={this.handleGetFinnListingDetails}>Get info</Form.Button>
          </Form.Group>
        </Form>
        <Divider horizontal>Or</Divider>
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

            <Form.Input
              value={price}
              name="price"
              fluid
              onChange={this.handleChange}
              label="Price"
              icon="dollar"
              iconPosition="left"
              placeholder="Price of flat"
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Select
              fluid
              label="Budget"
              options={budgetOptions}
              placeholder="Budget"
              value={budget}
              name="budget"
              onChange={this.handleChange}
            />
            <Form.Select
              fluid
              label="Property size"
              options={propertySizeOptions}
              placeholder="Property size"
              value={propertySize}
              name="propertySize"
              onChange={this.handleChange}
            />
            <Form.Select
              fluid
              label="Newness"
              options={newnessOptions}
              placeholder="Newness"
              value={newness}
              name="newness"
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Button>Evaluate</Form.Button>
        </Form>
      </Segment>
    )
  }
}

export default FlatRank
