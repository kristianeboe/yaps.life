import React, { Component } from 'react'
import Process from '../Landing/Process'
import Parallax from '../Landing/Parallax'
import FAQ from '../Landing/FAQ'


class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <div className="Home">
        <Parallax
          h1Content="Distributed co-living"
          h3Content=""
          h2Content="Move into a share house with others in a location determined by AI, all you need to do is register and we will do the rest."
          buttonContent="Register today!"
          buttonOnClick={() => document.getElementById('register-section').scrollIntoView()}
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
      </div>
    )
  }
}

export default Home
