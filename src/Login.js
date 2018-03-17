import React, { Component } from 'react'
import {
    Menu,
    Container,
    Modal,
    Header,
    Button,
    Form,
    Segment,
    Icon,
} from 'semantic-ui-react'
import firebase, { auth, facebookProvider, googleProvider } from './firebase'
import SignUp from './SignUp'


class SignIn extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
        }
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })
    handleSubmit = (event) => {
        event.preventDefault()
        const { email, password } = this.state
        firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
            console.log("user created succesfully", user.uid)
            this.setState({
                email: '',
                password: '',
            })
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    }

    facebookLogin = () => {
        auth.signInWithPopup(facebookProvider)
    }

    googleSignIn = () => {
        auth.signInWithPopup(googleProvider)
    }

    render() {
        console.log(this.state)
        return (


            <Modal trigger={<Menu.Item>Sign up</Menu.Item>} style={{ textAlign: 'center' }} >
                {/* <Modal.Header>
                    <Button.Group size='large'>
                        <Button color='grey' onClick={this.googleSignIn} > <Icon name='google' /> Google </Button>
                        <Button.Or />
                        <Button color='facebook' onClick={this.facebookLogin} >      <Icon name='facebook' /> Facebook    </Button>
                        <Button.Or />
                        <Button color='linkedin'>   <Icon name='linkedin' /> LinkedIn    </Button>
                    </Button.Group>
                </Modal.Header> */}

                <Modal.Content >
                    <SignUp />
                    {/* <Form size='large' onSubmit={this.handleSubmit}>
                        <Form.Input
                            fluid
                            icon='user'
                            iconPosition='left'
                            placeholder='E-mail address'
                            name='email'
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                        <Form.Input
                            fluid
                            icon='lock'
                            iconPosition='left'
                            placeholder='Password'
                            type='password'
                            name='password'
                            value={this.state.password}
                            onChange={this.handleChange}

                        />

                        <Button type="submit" color='teal' fluid size='large'>Sign up</Button>
                    </Form> */}
                </Modal.Content>
            </Modal>
        )
    }
}

export default SignIn