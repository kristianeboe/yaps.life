import React, { Component } from 'react'
import { Form, Comment, Header, Button } from 'semantic-ui-react'
import _ from 'underscore'
import { auth, firestore } from '../firebase'
import personAvatar from '../assets/images/personAvatar.png'

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
        const { listingId, matchId } = this.props

        const messagesRef = listingId ?
          firestore.collection('listings').doc(listingId).collection(matchId)
          :
          firestore.collection('matches').doc(matchId).collection('messages')

        messagesRef.orderBy('dateTime')
        this.unsubscribe = messagesRef.onSnapshot((snapshot) => {
          const messages = []
          snapshot.forEach((doc) => {
            messages.push(doc.data())
          })
          this.setState({ messages, messagesRef })
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
    /* const matchRef = this.props.matchDoc.ref
    const messagesRef = matchRef.collection('messages') */
    /* const messagesRef = listingId ?
      firestore.collection('listings').doc(listingId).collection(matchId)
        .orderBy('dateTime')
      :
      firestore.collection('matches').doc(matchId).collection('messages')
        .orderBy('dateTime') */
    const dateTime = new Date()

    this.state.messagesRef
      .add({
        text: messageText,
        dateTime,
        from: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL ? user.photoURL : personAvatar,
        },
      })
      .then(() => this.setState({ messageText: '' }))
  }
  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  render() {
    const { user } = this.state

    return (
      <Comment.Group style={{ maxWidth: '100%' }} size={this.props.groupChat ? 'large' : 'small'} >
        {this.props.groupChat &&
        <Header as="h3" dividing >
          Chat
          <Header.Subheader>
            Here you can get to know your new flatmates and discuss apartments you consider moving into
          </Header.Subheader>
        </Header>
      }
        {_.sortBy(this.state.messages, 'dateTime').map((message) => {
          const avatarStyle = { overflow: 'hidden', maxHeight: '35px' }
          let contentStyle = {}
          const userMessage = user.uid === message.from.uid
          if (userMessage) {
            avatarStyle.float = 'right'
            contentStyle = { marginRight: '3.5em', textAlign: 'right' }
          }
          const timeOfWriting = new Date(message.dateTime).toLocaleString().slice(0, 24)
          return (
            <Comment key={message.dateTime} >
              <Comment.Avatar src={message.from.photoURL} style={avatarStyle} />
              <Comment.Content style={contentStyle}>
                <Comment.Author as="a">{message.from.displayName}</Comment.Author>
                <Comment.Metadata>
                  <div>{timeOfWriting}</div>
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
          <Button type="submit" content="Add message" labelPosition="left" icon="edit" primary size={this.props.groupChat ? 'medium' : 'tiny'} />
        </Form>
      </Comment.Group>
    )
  }
}

export default ChatRoom
