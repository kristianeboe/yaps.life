import React, { Component } from 'react';
import {Sidebar, Segment, Image} from 'semantic-ui-react'
import AppHeader from './AppHeader';
import Process from './Process';
import Register from './Register';
import Paralax from './Paralax';
import './App.css';
import firebase from './firebase'

class App extends Component {
  state = { visible: false }
  
  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible } = this.state

    return (
      <div className='App'>
        <Sidebar.Pushable as={Segment} className="AppContent" >
          <AppHeader toggleVisibility={this.toggleVisibility} visible={visible}/>
          <Sidebar.Pusher onClick={() => this.setState({ visible: false })} >
            <Paralax
              h1_content='Are you a YAP?'
              h3_content='(YAP = Young Aspiring Professional)'
              h2_content='Move into a sharehouse with other yaps in a location determined by AI, all you need to do is register and we will do the rest.'
              button_content='Register today!'
              backgroundImage='url("/assets/images/yap_landing_compressed.jpg")'
              full_page
            />
            <Process />
            <Paralax
              h1_content='What is a YAP?'
              h3_content=''
              h2_content=''
              button_content=''
              backgroundImage='url("/assets/images/yap_man_compressed.jpg")'
            />
            <Register firebase={firebase}/>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export default App;
