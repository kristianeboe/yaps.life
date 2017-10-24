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
import Responsive from 'react-responsive';

const Mobile = ({ children }) => <Responsive maxWidth={768} children={children} />;
const Default = ({ children }) => <Responsive minWidth={768} children={children} />;

class AppHeader extends Component {

  
  render() {

    const {visible, toggleVisibility} = this.props
    return (
      <div>
        <Mobile>
          <Icon name='bars' size='large' onClick={toggleVisibility}/>
          <Sidebar
            as={Menu}
            animation='overlay'
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
        </Mobile>
        <Default>
          <Menu fixed='top'>
            <Menu.Item as='a' active>Home</Menu.Item>
            <Menu.Item as='a'>Hva er en YAS?</Menu.Item>
            <Menu.Item as='a'>For utleiere</Menu.Item>
            <Menu.Item as='a'>FAQ</Menu.Item>
            <Menu.Item position='right'>
              <Button as='a' >Din profil</Button>
              <Button as='a'  style={{ marginLeft: '0.5em' }}>Registrering</Button>
            </Menu.Item>
          </Menu>
        </Default>
      </div>
    )
  }
}

export default AppHeader