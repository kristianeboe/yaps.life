import React from 'react'
import { List } from 'semantic-ui-react'
import _ from 'underscore'

const FlatList = (props) => {
  const { flats } = props

  return (
    <List>
      { _.sortBy(flats, 'score').map(flat => (
        <List.Item key={flat.commuteScore} >
          <List.Content floated="right">{flat.commuteScore} commute score, {flat.groupScore} group score, {flat.price} kr pr month</List.Content>
          <List.Content>
            {flat.address ? flat.address : 'Address of place'}
          </List.Content>
        </List.Item>
      ))}
    </List>
  )
}

export default FlatList
