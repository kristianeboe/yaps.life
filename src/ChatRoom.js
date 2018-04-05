import React, { Component } from 'react'
import { Form, Comment, Header, Button } from 'semantic-ui-react'
import { auth } from './firebase'

class ChatRoom extends Component {
  constructor(props) {
    super(props)
    this.unsubscribe = null

    this.state = {
      user: null,
      messageText: '',
      messages: [],
    }
  }

  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({ user })
      if (user) {
        // const roomId = 'RnpKGueTLPA8V0y2A23j'
        // const chatRoomRef = firebase
        //   .firestore()
        //   .collection('chatRooms')
        //   .doc('RnpKGueTLPA8V0y2A23j')
        const matchRef = this.props.matchDoc.ref
        const messagesRef = matchRef.collection('messages').orderBy('dateTime')
        this.unsubscribe = messagesRef.onSnapshot((snapshot) => {
          const messages = []
          snapshot.forEach((doc) => {
            messages.push(doc.data())
          })
          this.setState({ messages })
        })
      } else {
        console.log('did mount auth state log out')
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  handleSubmit = () => {
    const { messageText, user } = this.state
    // const matchRef = firebase
    //   .firestore()
    //   .collection('matches')
    //   .doc(this.props.matchDoc.id)
    const matchRef = this.props.matchDoc.ref
    const messagesRef = matchRef.collection('messages')
    const dateTime = Date.now()

    messagesRef
      .add({
        text: messageText,
        dateTime,
        from: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      })
      .then(() => this.setState({ messageText: '' }))
  }
  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  render() {
    const { user } = this.state

    return (
      <Comment.Group style={{ maxWidth: '100%' }}>
        <Header as="h3" dividing>
          Chat
        </Header>
        {this.state.messages.map((message) => {
          const avatarStyle = { overflow: 'hidden', maxHeight: '35px' }
          let contentStyle = {}
          const userMessage = user.uid === message.from.uid
          if (userMessage) {
            avatarStyle.float = 'right'
            contentStyle = { marginRight: '3.5em', textAlign: 'right' }
          }

          return (
            <Comment key={message.dateTime} >
              <Comment.Avatar src={message.from.photoURL} style={avatarStyle} />
              <Comment.Content style={contentStyle}>
                <Comment.Author as="a">{message.from.displayName}</Comment.Author>
                <Comment.Metadata>
                  <div>{Date(message.dateTime).slice(0, 24)}</div>
                </Comment.Metadata>
                <Comment.Text>{message.text}</Comment.Text>
                {/* <Comment.Actions>
                  <Comment.Action>Reply</Comment.Action>
                </Comment.Actions> */}
              </Comment.Content>
            </Comment>
          )
        })}

        <Form reply onSubmit={this.handleSubmit}>
          <Form.Input
            placeholder="Chat here"
            name="messageText"
            value={this.state.messageText}
            onChange={this.handleChange}
          />
          <Button type="submit" content="Add message" labelPosition="left" icon="edit" primary />
        </Form>
      </Comment.Group>
    )
  }
}

export default ChatRoom
