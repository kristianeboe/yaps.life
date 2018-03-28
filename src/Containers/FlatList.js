import React from 'react'
import { List } from 'semantic-ui-react'

const FlatList = (props) => {
  const { flats } = props

  return (
    <List>
      {flats.map(flat => (
        <List.Item>
          <List.Content floated="right">{flat.score}</List.Content>
          <List.Content>
            {flat.address ? flat.address : 'Address of place'}
          </List.Content>
        </List.Item>
      ))}
    </List>
  )
}

export default FlatList
