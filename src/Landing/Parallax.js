import React from 'react'
import {
  Button,
  Container,
  Header,
  Item,
  Grid,
} from 'semantic-ui-react'
import { Link } from 'react-router-dom'

const Parallax = (props) => {
  const {
    h1Content,
    h3Content,
    h2Content,
    buttonContent,
    buttonOnClick,
    backgroundImage,
    fullPage
  } = props


  const viewHeight = fullPage ? '100vh' : '50vh'

  return (
    <div
      style={{
        textAlign: 'center',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center center',
        backgroundImage,
        backgroundSize: 'cover',
        boxShadow: 'inset 0 0 0 2000px rgba(0,0,0,0.4)',
        height: viewHeight,
      }}
    >
      <Item.Content style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      >
        <Container text>
          <Header
            as="h1"
            content={h1Content}
            inverted
            style={{
              fontSize: '3em', fontWeight: 'normal', marginBottom: 0, marginTop: '0'
            }}
          />
          <Header
            as="h3"
            content={h3Content}
            inverted
            style={{ fontSize: '1em', fontWeight: 'normal' }}
          />
          <Header
            as="h2"
            content={h2Content}
            inverted
            style={{ fontSize: '1.5em', fontWeight: 'normal' }}
          />
          {buttonContent.length > 0 && (
            <Grid columns="equal" stackable>
              <Grid.Column>
                <Link to="/matches"><Button primary size="large" onClick={buttonOnClick} >I already have roommates</Button></Link>
              </Grid.Column>
              <Grid.Column>
                <Link to="/profile"><Button primary size="large" onClick={buttonOnClick} >Find new roommates with AI</Button></Link>
              </Grid.Column>
              <Grid.Column>
                <Link to="/landlord-view"><Button primary size="large" onClick={buttonOnClick} >Match my apartment with tenants</Button></Link>
              </Grid.Column>
            </Grid>
          )}
        </Container>
      </Item.Content>
    </div>
  )
}

export default Parallax
