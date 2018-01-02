import React, { Component } from 'react'
import {
  Button,
  Menu,
  Icon,
  Sidebar,
  Segment,
  Header,
  Image
} from 'semantic-ui-react'

class AppHeader extends Component {

  
  render() {

    const {visible, toggleVisibility} = this.props
    return (
      <div className="AppHeader">
        <Icon name='bars' size='big' onClick={toggleVisibility} style={{
          position: 'fixed',
          top: '0.5em',
          right: '0.5em',
          zIndex: '5',
        }}/>
        <Sidebar
            as={Menu}
            animation='push'
            width='wide'
            direction='right'
            visible={visible}
            icon='labeled'
            vertical
            inverted
          >
          <Menu.Item name='home'>
            <Icon name='home' />
              Home
          </Menu.Item>
          <Menu.Item name='gamepad'>
            <Icon name='gamepad' />
              Games
          </Menu.Item>
          <Menu.Item name='camera'>
            <Icon name='camera' />
              Channels
          </Menu.Item>
        </Sidebar>
      </div>
    )
  }
}

export default AppHeader