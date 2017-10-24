import React, { Component } from 'react';
import {Sidebar, Segment} from 'semantic-ui-react'
import AppHeader from './AppHeader';
import Process from './Process';
import Register from './Register';
import Paralax from './Paralax';
import './App.css';

class App extends Component {
  state = { visible: false }
  
  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible } = this.state

    return (
      <div className='App'>
        <Sidebar.Pushable as={Segment} >
          <AppHeader toggleVisibility={this.toggleVisibility} visible={visible}/>
          <Sidebar.Pusher onClick={() => this.setState({ visible: false })}>
            <Paralax
              h1_content='ER DU EN YAS MED SOMMERJOBB?'
              h3_content='(YAS = Young Aspiring Student)'
              h2_content='Flytt inn i kollektiv med andre ambisiøse studenter som også har fått sommerjobb i de beste bedriftene, alt du trenger å gjøre er å registrere deg så fikser vi resten.'
              button_content='Registrer deg i dag!'
              backgroundImage='url("/assets/images/thomas-brault-15523.jpg")'
            />
            <Paralax
              h1_content=''
              h3_content=''
              h2_content=''
              button_content=''
              backgroundImage='url("/assets/images/live.jpg")'
            />
            {/* <Landing /> */}
            <Process />
            <Register />
            <Paralax
              h1_content='What is a YAP?'
              h3_content=''
              h2_content=''
              button_content=''
            />
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export default App;
