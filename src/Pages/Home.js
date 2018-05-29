import React from 'react'
import Process from '../Landing/Process'
import Parallax from '../Landing/Parallax'
import FAQ from '../Landing/FAQ'
import About from '../Landing/About'
// import Process2 from '../Landing/Process2'
import Landlords from '../Landing/Landlords'

const Home = () => (
  <div className="Home">
    <Parallax
      h1Content="Distributed Co-Living"
      h3Content="Home-as-a-Service"
      h2Content="Get matched into a shared flat with AI - register and we'll do the rest."
      buttonContent="Register today!"
          // buttonOnClick={() => document.getElementById('register-section').scrollIntoView()}
      backgroundImage='url("/assets/images/yap_landing_compressed.jpg")'
      fullPage
    />
    <Process />
    <Parallax
      h1Content="For landlords"
      h3Content=""
      h2Content="Find the perfect tenants"
      buttonContent=""
      backgroundImage='url("/assets/images/landlords.jpg")'
    />
    <Landlords />
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


export default Home
