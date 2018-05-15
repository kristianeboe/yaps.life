import React, { Component } from 'react'
import { Accordion, Icon } from 'semantic-ui-react'
import ChatRoom from './ChatRoom'

export default class ChatAccordion extends Component {
  constructor(props) {
    super(props)
    this.state = { activeIndex: -1 }
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state
    const { listingId, matchId, landlord } = this.props
    return (
      <Accordion styled>
        <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
          <Icon name="dropdown" />
          Chat with {landlord ? 'tenants' : 'landlord'}
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          {listingId && matchId &&
            <ChatRoom listingId={listingId} matchId={matchId} />
          }
        </Accordion.Content>
      </Accordion>
    )
  }
}
