import React from 'react'
import {
  Button,
  Container,
  Header,
  Icon,
  Item,
} from 'semantic-ui-react'
import './App.css';

const Parallax = (props) => {
  const {
    h1_content,
    h3_content,
    h2_content,
    button_content,
    button_onClick,
    backgroundImage,
    full_page } = props

  let view_height = 0
  full_page ? view_height = '100vh' : view_height = '50vh'

  return (
    <div
      style={{
        textAlign:'center',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center center',
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
        height: view_height,
      }}
    >
      <Item.Content style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Container text>
          <Header
            as='h1'
            content={h1_content}
            inverted
            style={{ fontSize: '3em', fontWeight: 'normal', marginBottom: 0, marginTop: '0' }}
          />
          <Header
            as='h3'
            content={h3_content}
            inverted
            style={{ fontSize: '1em', fontWeight: 'normal' }}
          />
          <Header
            as='h2'
            content={h2_content}
            inverted
            style={{ fontSize: '1.5em', fontWeight: 'normal' }}
          />
          {button_content.length > 0 && (
            <Button primary size='huge' onClick={button_onClick} >
              {button_content}
              <Icon name='right arrow' />
            </Button>
          )}
        </Container>
      </Item.Content>
    </div>
  )
}

export default Parallax;