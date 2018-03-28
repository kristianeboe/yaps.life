import React, { Component } from 'react'
import { Form, Segment } from 'semantic-ui-react'
import axios from 'axios'
import FlatList from './Containers/FlatList'

class FlatRank extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: '',
      price: '',
      flats: [{ address: 'Arnebråtveien 75D', price: 25000, score: 10 }]
    }
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    console.log('submit')

    const { address, price } = this.state

    if (address.length < 1 || price.length < 1) {
      console.log('address or price too short')
      return
    }

    this.setState({
      flats: [...this.state.flats, { address, price, score: 0 }]
    })
    const url = ''
    axios
      .post(url, {
        address,
        flatmates: this.props.roommates
      })
      .then((response) => {
        console.log(response)
      })
      .catch(err => console.log('Error in evaluating apartment axios', err))
  }

  render() {
    const { address, price, flats } = this.state

    return (
      <Segment>
        <FlatList flats={flats} />
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
