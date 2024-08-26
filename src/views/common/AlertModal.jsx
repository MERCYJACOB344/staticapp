import React, { useState } from 'react';
import { Modal, Button} from 'react-bootstrap';

const AlertModal = ({ show, setShow, alertMessage }) => {  
  return (
    <Modal backdrop="static" keyboard={false} show={show}  onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title id="staticBackdropLabel">Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body><h5 className="label" style={{ color: 'red' }}>{alertMessage}</h5></Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Ok</Button>
        </Modal.Footer>
      </Modal>
  );
};

export default AlertModal;
