import React from 'react'
import { Segment, Container, Header } from 'semantic-ui-react'

const FAQ = props => (
  <Container>
    <Segment vertical style={{ padding: '5em 0em' }}>
      <Header size="large">Jeg har fått sommerjobb et annet sted enn Oslo, kan du matche meg inn i et kollektiv der jeg skal?</Header>
      <p>Pr i dag fungerer tjenesten kun for de med sommerjobb i Oslo, men innen neste sommer dekker vi hele landet.</p>
      <Header size="large">Er tjenesten gratis?</Header>
      <p>
        JA! For deg som leier betaler du ingenting til oss, kun den vanlige leiesummen til utleier.
        Hvis du er utleier selv er det enda bedre! Vi hjelper deg å spare penger i løpet av sommeren og tar kun 10% av leien du ellers ikke ville fått.
      </p>
      <Header size="large">Hvor ligger kollektivene? Hvordan er standaren?</Header>
      <p>Mange av kollektivene vil bli satt opp i SiO student landsbyer, men vi har også andre utleiepartnere vi kan gå til. Alle utleieobjekter har garantert god standard og god kollektivtransport forbindelse.</p>
      <Header size="large">Jeg er ferdig som student og skal begynne i fast jobb til høsten? Kan dere matche meg inn i et kollektiv som varer lenger enn sommeren?</Header>
      <p>Sjekk ut punktet "Hva er en YAS over" og skriv deg opp på emaillista :)</p>
    </Segment>
  </Container>
)

export default FAQ
