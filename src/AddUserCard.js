import React, { Component } from 'react'
import { Image, Grid, Card, Segment, Container, Search, Header } from 'semantic-ui-react'
import signup from './assets/images/signup.jpg'
import firebase, { auth } from './firebase'
import _ from 'underscore'


class AddUserCard extends Component {
  state = {
    isLoading: false,
    value: '',
    availableUsers: [],
  }

  componentWillMount() {
    this.resetComponent()
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection('users')
      .get()
      .then(snapshot => {
        const availableUsers = []
        snapshot.forEach(userDoc => {
          const user = userDoc.data()
          availableUsers.push(user)
        })
        this.setState({ availableUsers })
      })
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => this.setState({ value: result.title })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const results = this.state.availableUsers.filter(user => user.displayName.includes(this.state.value)).map(user => ({ title: user.displayName, description: user.displayName }))
      console.log(this.state.availableUsers.filter(user => user.displayName.includes(this.state.value)))
      this.setState({
        isLoading: false,
        results,
      })
    }, 300)
  }
  render() {
    const { isLoading, value, results } = this.state
    console.log(this.state)
    return (
      <Card>
        <Image src={signup} />
        <Card.Header>Add person</Card.Header>
        <Card.Description>Search available users by email</Card.Description>
        <Card.Content>
          <Search
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
            results={results}
            value={value}
            {...this.props}
          />
        </Card.Content>
      </Card>
    )
  }
}

export default AddUserCard
