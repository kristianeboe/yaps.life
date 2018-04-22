import React, { Component } from 'react'
import {
  Button,
  Container,
  Segment,
  Form,
  Grid,
  Checkbox,
  Message,
  Label,
  Popup,
  Header
} from 'semantic-ui-react'
import { Redirect, Link } from 'react-router-dom'
import firebase, { auth } from '../firebase'
import PropertySegment from '../Containers/PropertySegment'
import LandlordCard from '../Containers/LandlordCard'
import UploadListing from '../Components/UploadListing'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'Male' },
  { key: 'f', text: 'Female', value: 'Female' }
]


class LandlordProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      displayName: '',
      photoURL: '',
      email: '',
      phone: '',
      rating: '',
      numberOfListings: '',
      tos: false,
      readyToMatch: false,
      listings: [],
      landlordProfileLoading: true,
      myListingsLoading: true,
    }
  }

  async componentDidMount() {
    auth.onAuthStateChanged(async (user) => {
      this.setState({
        user
      })
      if (user) {
        const listingsSnapshot = await firebase.firestore().collection('listings').where('ownerId', '==', user.uid)
          .get()
        const listings = []
        listingsSnapshot.forEach(listing => listings.push(listing.data()))
        this.setState({ listings, myListingsLoading: false })
        const userDoc = await firebase.firestore().collection('users').doc(user.uid)
          .get()
        const {
          displayName, age, gender, email, phone, photoURL, rating
        } = userDoc.data()
        this.setState({
          displayName, age, gender, email, phone, photoURL, rating, user, landlordProfileLoading: false,
        })
      }
    })
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    const landlord = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      email: this.state.email,
      phone: this.state.phone,
      landlord: true,
    }

    firebase.firestore().collection('users').doc(this.state.user.uid).update(landlord)
  }

  render() {
    const {
      displayName, photoURL, email, rating, phone, numberOfListings, gender, age,
    } = this.state
    return (
      <div style={{
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center center',
        // backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
        backgroundImage: 'url("/assets/images/yap_landing_compressed.jpg")',
        backgroundSize: 'cover',
        boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
        }}
      >

        <Container style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
          <Grid>
            <Grid.Column width="10">
              <Segment loading={this.state.landlordProfileLoading}>
                <Grid columns="equal">
                  <Grid.Column>
                    <Form>
                      <Header>My Landlord profile</Header>
                      <Form.Input
                        fluid
                        label="Name"
                        placeholder="Name"
                        name="displayName"
                        value={displayName}
                        onChange={this.handleChange}
                      />
                      <Form.Group widths="equal">
                        <Form.Input
                          fluid
                          label="Age"
                          placeholder="Age"
                          name="age"
                          value={age}
                          onChange={this.handleChange}
                        />
                        <Form.Select
                          fluid
                          style={{ zIndex: 65 }}
                          label="Gender"
                          options={genderOptions}
                          placeholder="Gender"
                          value={gender}
                          name="gender"
                          onChange={this.handleChange}
                        />
                      </Form.Group>
                      <Form.Input
                        fluid
                        label="Email"
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={this.handleChange}
                      />
                      <Form.Input
                        fluid
                        label="Phone"
                        placeholder="Phone"
                        name="phone"
                        value={phone}
                        onChange={this.handleChange}
                      />
                      <Form.Button type="submit">Update</Form.Button>
                    </Form>
                  </Grid.Column>
                  <Grid.Column>
                    <LandlordCard landlord={{
                      displayName,
                      photoURL,
                      email,
                      rating: 5,
                      numberOfListings: 2,
                      phone,
                      age,
                    }}
                    />
                  </Grid.Column>
                </Grid>
              </Segment>
            </Grid.Column>
            <Grid.Column width="6" >
              <Segment loading={this.state.myListingsLoading} >
                <Header>My listings</Header>
                {this.state.listings.map((listing, index) => <PropertySegment key={listing.address} property={listing} index={index} />)}
              </Segment>
            </Grid.Column>
          </Grid>
          <UploadListing user={this.state.user} />

        </Container>
      </div>
    )
  }
}

export default LandlordProfile
