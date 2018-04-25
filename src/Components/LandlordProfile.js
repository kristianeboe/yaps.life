import React, { Component } from 'react'
import {
  Container,
  Segment,
  Form,
  Grid,
  Header,
  Message,
} from 'semantic-ui-react'
import { auth, firestore } from '../firebase'
import PropertySegment from '../Containers/PropertySegment'
import LandlordCard from '../Containers/LandlordCard'
import UploadListing from '../Components/UploadListing'
import ContactInfo from '../Containers/ContactInfo'
import { LandlordFormValidation } from '../utils/FormValidations'
import FlatList from '../Containers/FlatList'

class LandlordProfile extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null
    this.state = {
      user: null,
      displayName: '',
      age: '',
      gender: '',
      photoURL: '',
      email: '',
      phone: '',
      rating: '',
      numberOfListings: '',
      listings: [],
      landlordProfileLoading: true,
      myListingsLoading: true,
      errors: {},
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged(async (user) => {
      this.setState({
        user
      })
      if (user) {
        this.unsubscribe = firestore.collection('listings').where('ownerId', '==', user.uid)
          .onSnapshot((listingsSnapshot) => {
            const listings = []
            listingsSnapshot.forEach(listing => listings.push({ listing: listing.data() }))
            this.setState({ listings, myListingsLoading: false })
          })
        const userDoc = await firestore.collection('users').doc(user.uid).get()
        const {
          displayName, age, gender, email, phone, photoURL, rating
        } = userDoc.data()
        this.setState({
          displayName, age, gender, email, phone, photoURL, rating, user, landlordProfileLoading: false,
        })
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  handleChange = (e, { name, value }) => {
    if (e) e.preventDefault()
    this.setState({ [name]: value })
  }

  handleSubmit = async () => {
    this.setState({ landlordProfileLoading: true })

    const formFields = {
      displayName: this.state.displayName,
      age: this.state.age,
      gender: this.state.gender,
      email: this.state.email,
      phone: this.state.phone,
    }

    const errors = {}
    let errorFlag = false
    Object.keys(formFields).forEach((key) => {
      const value = formFields[key]
      if (!LandlordFormValidation[key](value)) {
        errors[key] = true
        errorFlag = true
      }
    })
    if (!errorFlag) {
      const landlord = {
        ...formFields,
        landlord: true,
      }
      await firestore.collection('users').doc(this.state.user.uid).update(landlord)
      this.setState({ landlordProfileLoading: false, landlordProfileError: false, landlordProfileSuccess: true })
    } else {
      this.setState({ errors, landlordProfileError: true, landlordProfileLoading: false })
    }
  }


  render() {
    const {
      displayName, age, gender, photoURL, email, rating, phone, numberOfListings,
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
          <Grid stackable >
            <Grid.Column width="10">
              <Segment loading={this.state.landlordProfileLoading}>
                <Grid columns="equal" stackable>
                  <Grid.Column>
                    <Form error={this.state.landlordProfileError} success={this.state.landlordProfileSuccess} >
                      <Header>My Landlord profile</Header>
                      <ContactInfo
                        contactInfo={{
                          displayName, age, gender, email, phone
                        }}
                        landlord
                        handleChange={this.handleChange}
                        errors={this.state.errors}
                      />
                      <Form.Button onClick={this.handleSubmit}>Update</Form.Button>
                      <Message
                        error
                        header="Update unsuccessful"
                        content="Fix the errors in the form and try again"
                      />
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
                <FlatList flats={this.state.listings} />
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
