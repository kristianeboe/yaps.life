import React from 'react'
import { Segment, Container, Header } from 'semantic-ui-react'

const FAQ = () => (
  <Container>
    <Segment vertical style={{ padding: '5em 0em' }}>
      <Header size="large">
        I have landed an internship somewhere else than Oslo, can you still match me into a shared flat where I am going?
      </Header>
      <p>As of today the service only operates in Oslo, Norway, but send us an <a href="mailto:hello@yaps.no" >email</a> at about where you want to go and we will see about setting up the service there.</p>
      <Header size="large">Is the service free?</Header>
      <p>
        YES!
        {/* JA! For deg som leier betaler du ingenting til oss, kun den vanlige leiesummen til utleier.
        Hvis du er utleier selv er det enda bedre! Vi hjelper deg å spare penger i løpet av sommeren og tar kun 10% av leien du ellers ikke ville fått. */}
      </p>
      <Header size="large">What does YAPS.life stand for?</Header>
      <p>
        YAPS is short for Young Aspiring Professionals which is the main target group for this application. Todays young professionals wait longer before buying a home sometimes because
        real estate has gotten more expensive, but also because living in a shared household with other YAPS can be very fullfilling as well as boost your career. This site facilitates
        the creation of new YAP flatshares every day and optimizes the experience for everyone.
        {/* JA! For deg som leier betaler du ingenting til oss, kun den vanlige leiesummen til utleier.
        Hvis du er utleier selv er det enda bedre! Vi hjelper deg å spare penger i løpet av sommeren og tar kun 10% av leien du ellers ikke ville fått. */}
      </p>
      {/* <Header size="large">Hvor ligger kollektivene? Hvordan er standaren?</Header>
      <p>Mange av kollektivene vil bli satt opp i SiO student landsbyer, men vi har også andre utleiepartnere vi kan gå til. Alle utleieobjekter har garantert god standard og god kollektivtransport forbindelse.</p>
      <Header size="large">Jeg er ferdig som student og skal begynne i fast jobb til høsten? Kan dere matche meg inn i et kollektiv som varer lenger enn sommeren?</Header>
      <p>Sjekk ut punktet "Hva er en YAS over" og skriv deg opp på emaillista :)</p> */}
    </Segment>
  </Container>
)

export default FAQ
