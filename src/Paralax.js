import React from 'react'
import {
  Button,
  Container,
  Header,
  Icon,
  Segment,
  Item
} from 'semantic-ui-react'
import './App.css';

const Paralax = (props) => {
    const {h1_content, h3_content, h2_content, button_content, backgroundImage, full_page} = props

    let view_height = 0
    full_page ? view_height = '100vh' : view_height = '50vh'

    return (
      <Item>
      <Segment
          inverted
          textAlign='center'
          vertical
          style={{
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center center',
            backgroundImage: backgroundImage,
            backgroundSize: 'cover',
            boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
            height: view_height,
            padding: '1em 0em',
          }}
      >
          <Container text>
          <Item.Content verticalAlign='middle'>
            <Header
              as='h1'
              content={h1_content}
              inverted
              style={{ fontSize: '3em', fontWeight: 'normal', marginBottom: 0, marginTop: '3em' }}
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
              <Button primary size='huge'>
                {button_content}
              <Icon name='right arrow' />
              </Button>
            )}
            </Item.Content>
      </Container>
      </Segment>
        </Item>

    )
}

export default Paralax;