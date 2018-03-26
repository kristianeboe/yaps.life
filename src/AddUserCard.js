import React, { Component } from 'react'
import { Grid, Card, Segment, Container, Search, Header } from 'semantic-ui-react'
import signup from './assets/images/signup.jpg'
import firebase, { auth } from './firebase'

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
      })
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => this.setState({ value: result.title })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.title)

      this.setState({
        isLoading: false,
        results: _.filter(source, isMatch),
      })
    }, 300)
  }
  render() {
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
