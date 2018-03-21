import React, { Component } from 'react';
import AppHeader from './AppHeader';
import Process from './Process';
import Parallax from './Parallax';
import './App.css';



class Home extends Component {

  render() {

    return (
      <div className='Home'>
        <AppHeader />
        <Parallax
          h1_content='Distributed co-living'
          h3_content=''
          h2_content='Move into a share house with others in a location determined by AI, all you need to do is register and we will do the rest.'
          button_content='Register today!'
          button_onClick={() => document.getElementById('register-section').scrollIntoView()}
          backgroundImage='url("/assets/images/yap_landing_compressed.jpg")'
          full_page
        />
        <Process />
        
        <Parallax
          h1_content='What is a YAP?'
          h3_content=''
          h2_content=''
          button_content=''
          backgroundImage='url("/assets/images/yap_man_compressed.jpg")'
        />
        <Process />
        {/* <Register /> */}
      </div>
    );
  }
}

export default Home;
