import React, { Component } from 'react';
import { Sidebar, Segment, } from 'semantic-ui-react'
import AppHeader from './AppHeader';
import Process from './Process';
import Register from './Register';
import Parallax from './Parallax';
import './App.css';



class Home extends Component {
  state = { visible: false }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible } = this.state

    return (
      <div className='Home'>
        <AppHeader />
        <Sidebar.Pushable as={Segment} >
          <Sidebar.Pusher onClick={() => this.setState({ visible: false })} >
            <Parallax
              h1_content='Are you a YAP?'
              h3_content='(YAP = Young Aspiring Professional)'
              h2_content='Move into a sharehouse with other yaps in a location determined by AI, all you need to do is register and we will do the rest.'
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
            <Register />
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export default Home;
