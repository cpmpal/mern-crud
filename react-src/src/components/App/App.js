import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';
//import axios from 'axios';
import io from 'socket.io-client';
//iimport ModalUser from '../ModalUser/ModalUser';
import Cal from '../Cal/Cal';
import './App.css';
import MenuLogin from '../MenuLogin/MenuLogin';
import SegmentEvent from '../SegmentEvent/SegmentEvent';

class App extends Component {


  constructor() {
    super();

    this.server = process.env.REACT_APP_API_URL || '';
    this.socket = io.connect(this.server);

    this.state = {
      userLoggedIn: null,
      user : null,
      users : [],
      event : null
    }
    this.handleNewEvent = this.handleNewEvent.bind(this);
    this.handleUserLogin = this.handleUserLogin.bind(this);
  }

  // Place socket.io code inside here
  componentDidMount() {
    this.socket.on('new event', data => this.handleNewEvent(data));
  }

  /*
  fetchEvents() {
    axios.get(`${this.server}/api/events`)
      .then((response) => {
        response.data.forEach((e) => {
          e.start = moment(e.start).toDate();
          e.end = moment(e.end).toDate();
        });
        console.log(response.data);
        this.setState({ events: response.data });
        console.log('got events');
      })
      .catch((err) => {
        console.log(err);
      });
  }
  */
  
  handleUserDeleted(user) {
    let users = this.state.users.slice();
    users = users.filter(u => { return u._id !== user._id; });
    this.setState({ users: users });
  }

  handleUserLogin(u) {
    console.log('it fired');
    console.log(u);
    this.setState({ user :  u,
                 userLoggedIn : u.name});
  }

  handleNewEvent(e) {
    this.setState({
      event: e
    });
  }

  render() {
    return (
      <div>
        <Container>
          <MenuLogin
            onUserLogin={this.handleUserLogin}
            server={this.server}
            socket={this.socket}
            userLoggedIn={this.state.userLoggedIn}
          />
          <SegmentEvent
            eventSelected={this.state.event}
            userLoggedIn={this.userLoggedIn}
            server={this.server}
          />
          <Cal 
            userLoggedIn={this.state.userLoggedIn}
            server={this.server}
            socket={this.socket}
            handleNewEvent={this.handleNewEvent}
          />
        </Container>
        <br/>
      </div>
    );
  }
}

export default App;
