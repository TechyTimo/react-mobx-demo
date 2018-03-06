import React, { Component } from 'react';
import { observer } from "mobx-react"
import { withRouter } from "react-router-dom"
import store from '../../store.js';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

@observer
class Confirm extends Component {

  toggleConfirm() {
    store.confirmOpen = !store.confirmOpen
  }

  render() {
    return (
      <Modal isOpen={store.confirmOpen} toggle={this.toggleConfirm} className="modal-info">
        <ModalHeader toggle={this.toggleConfirm}>{store.confirmTitle}</ModalHeader>
        <ModalBody>
          <div className="form-group">{ store.confirmText }</div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggleConfirm}>Cancel</Button>
          <Button className="float-right" color="danger" onClick={store.confirmCallback}>Yes</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export default withRouter(Confirm);
