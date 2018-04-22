import React, { Component } from 'react'
import Process from '../Landing/Process'
import Parallax from '../Landing/Parallax'
import FAQ from '../Landing/FAQ'
import About from '../Landing/About'

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    console.log(this.props)
    return (
      <div className="Home">
        <Parallax
          h1Content="Disributed Co-Living"
          h3Content="Home-as-a-service"
          h2Content="Get matched into a shared household with AI. All you need to do is register and we will do the rest."
          buttonContent="Register today!"
          // buttonOnClick={() => document.getElementById('register-section').scrollIntoView()}
          backgroundImage='url("/assets/images/yap_landing_compressed.jpg")'
          fullPage
        />
        <Process />

        <Parallax
          h1Content="F.A.Q."
          h3Content=""
          h2Content=""
          buttonContent=""
          backgroundImage='url("/assets/images/yap_man_compressed.jpg")'
        />
        <FAQ />
        <About />
      </div>
    )
  }
}

export default Home
