import React, { Component } from 'react';
import {Modal } from 'semantic-ui-react';

import FormUser from '../FormUser/FormUser';

const inlineStyle = {
  modal : {
        marginTop: '0px !important',
        marginLeft: 'auto',
        marginRight: 'auto'
      
  },
  link : {
      'text-decoration' : 'underline',
      'cursor' : 'pointer'
  }

};

class ModalUser extends Component {

  render() {
    return (
      <Modal
        trigger={<a style={inlineStyle.link}>{this.props.buttonTriggerTitle}</a>}
        dimmer='inverted'
        size='tiny'
        closeIcon='close'
        style={inlineStyle.modal}
      >
        <Modal.Header>{this.props.headerTitle}</Modal.Header>
        <Modal.Content>
          <FormUser
            buttonSubmitTitle={this.props.buttonSubmitTitle}
            buttonColor={this.props.buttonColor}
            userID={this.props.userID}
            server={this.props.server}
            socket={this.props.socket}
          />
        </Modal.Content>
      </Modal>
    );
  }
}

export default ModalUser;
