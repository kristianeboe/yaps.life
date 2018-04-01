import React, { Component } from 'react'
import { Form, Segment } from 'semantic-ui-react'
import axios from 'axios'
import FlatList from './Containers/FlatList'
import firebase from './firebase'

class FlatRank extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      price: '',
      // flats: [{ address: 'Arnebråtveien 75D', price: 25000, score: 10 }],
      segmentLoading: false,
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    console.log('submit')

    const { address, price } = this.state
    const { propertyList, flatmates, matchDoc } = this.props

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
    console.log(data)
    const url = 'https://us-central1-yaps-1496498804190.cloudfunctions.net/scoreApartment'
    axios
      .post(url, data)
      .then((response) => {
        console.log(response)
        const { score } = response.data
        propertyList.push({
          address,
          price,
          score,
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
    const { propertyList } = this.props

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
          <Form.Button>Evaluate</Form.Button>
        </Form>
      </Segment>
    )
  }
}

export default FlatRank
