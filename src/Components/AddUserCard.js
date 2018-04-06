import React, { Component } from 'react'
import { Image, Card, Search } from 'semantic-ui-react'
import _ from 'underscore'
import personAvatar from '../assets/images/personAvatar.png'
import firebase from '../firebase'


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
      .then((snapshot) => {
        const availableUsers = []
        snapshot.forEach((userDoc) => {
          const user = userDoc.data()
          availableUsers.push(user)
        })
        this.setState({ availableUsers })
      })
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => {
    const userData = this.state.availableUsers.find(el => el.uid === result.key)

    this.props.addFlatmateToMatch(userData)

    this.setState({ value: result.title })
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const results = this.state.availableUsers.filter(user => user.displayName.toLowerCase().includes(this.state.value.toLowerCase())).map(user => ({
        key: user.uid, value: user.uid, title: user.displayName, image: user.photoURL, description: user.workplace
      }))
      console.log(this.state.availableUsers.filter(user => user.displayName.includes(this.state.value)))
      this.setState({
        isLoading: false,
        results,
      })
      return true
    }, 300)
  }
  render() {
    const { isLoading, value, results } = this.state
    console.log(this.state)
    return (
      <Card>
        <Image src={personAvatar} />
        <Card.Content>
          <Card.Header>Add person</Card.Header>
          <Card.Description>Search available users by email</Card.Description>
        </Card.Content>
        <Card.Content>
          <Search
            fluid
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
            results={results}
            value={value}
          />
        </Card.Content>
      </Card>
    )
  }
}

export default AddUserCard
