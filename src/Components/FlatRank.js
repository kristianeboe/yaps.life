import React, { Component } from 'react'
import { Form, Segment } from 'semantic-ui-react'
import axios from 'axios'
import euclidianDistanceSquared from 'euclidean-distance/squared'
import FlatList from '../Containers/FlatList'
import firebase from '../firebase'


const budgetOptions = [
  { key: '1', value: '1', text: 'Cheap' },
  { key: '2', value: '3', text: 'Medium' },
  { key: '3', value: '5', text: 'Premium' }
]

const propertySizeOptions = [
  { key: '1', value: '1', text: 'small' },
  { key: '2', value: '3', text: 'medium' },
  { key: '3', value: '5', text: 'large' }
]

const newnessOptions = [
  { key: '1', value: '1', text: 'Old' },
  { key: '2', value: '3', text: 'Refurbished' },
  { key: '3', value: '5', text: 'Brand new' }
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
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  mapPropScoreToPercentage = propScore => Math.floor((1 - (propScore / 48)) * 100)

  handleSubmit = () => {
    console.log('submit')

    const {
      address, price, budget, propertySize, newness
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

  render() {
    const {
      address, price, segmentLoading
    } = this.state
    const {
      propertyList, budget, propertySize, newness
    } = this.props

    return (
      <Segment loading={segmentLoading} >
        <FlatList flats={propertyList} />
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths="equal">
            <Form.Input
              value={address}
              name="address"
              fluid
              onChange={this.handleChange}
              label="Address of property"
              icon="home"
              iconPosition="left"
              placeholder="Enter address"
            />
            <Form.Input
              value={price}
              name="price"
              fluid
              onChange={this.handleChange}
              label="Price"
              placeholder="Price of flat"
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Select
              fluid
              label="Budget"
              options={budgetOptions}
              placeholder="budget"
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
