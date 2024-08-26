import React, { useState } from 'react';
import { getLocalStorage } from '../../../lib/commonLib';
import { Modal, Button, CloseButton, Toast } from 'react-bootstrap';
import { API, Auth } from 'aws-amplify';


const FeedbackModal = ({ show, setShow }) => {
  const [message, setMessage] = useState('');
  const [feedbackSendBtnStatus, setFeedbackSendBtnStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customToast, setCustomToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const handleChange = event => {
    setMessage(event.target.value);
  };
  function closeFeedback() {
    setMessage("");
    setFeedbackSendBtnStatus(false);
    //setCustomToast(false)
    setShow(false);
  }
  async function sendFeedback() {
    setLoading(true);
    setFeedbackSendBtnStatus(true);
    const uasUser = getLocalStorage('uasUser', 'no local storage');
    const email = uasUser.userInfo.email;
    const name = uasUser.userInfo.name;
    const company = uasUser.userInfo.company;
    let group = "";
    if (uasUser.userInfo.group == 'admin'){
      group = 'Administrator';
    } else if (uasUser.userInfo.group == 'reviewer'){
      group = 'Reviewer';
    } else if (uasUser.userInfo.group == 'pilot'){
      group = 'Pilot';
    }

    const emailBody = `\nName      - `  + name + `\n`+
                      `Email     - `  + email + `\n` +
                      `Company   - `   + company + `\n` +
                      `Role      - `   + group + `\n` +
                      `Feedback  - `   + message + `\n`;

    const emailBodyTemp = `<html><body><table style="width: 100%; background-color: #3d4650;" border="2">`+
      `< tbody >`+
        `<tr>`+
        `<td style="color:#fff">&nbsp;Name&nbsp;</td>`+
      `<td style="color:#fff">&nbsp;` + name +`&nbsp;</td>`+
        `</tr>`+
        `<tr>`+
        `<td style="color:#fff">&nbsp;Email&nbsp;</td>`+
      `<td style="color:#fff">&nbsp;` + email +`&nbsp;</td>`+
        `</tr>`+
        `<tr>`+
        `<td style="color:#fff">&nbsp;Company&nbsp;</td>`+
      `<td style="color:#fff">&nbsp;` + company +`&nbsp;</td>`+
        `</tr>`+
        `<tr>`+
        `<td style="color:#fff">&nbsp;Role&nbsp;</td>`+
      `<td style="color:#fff">&nbsp;` + group +`&nbsp;</td>`+
        `</tr>`+
        `<tr>`+
        `<td style="color:#fff">&nbsp;Feedback&nbsp;</td>`+
      `<td style="color:#fff">&nbsp;` + message +`&nbsp;</td>`+
        `</tr>`+
        `</tbody >`+
`</table ></body></html>`;
    const messageData = {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
      },   
      body: {
        text: emailBody,
        subject: "UAS Feedback"
      },
    };
    console.log(messageData);
    API.post('UASDashboard', `/notification/sendSuggestion`, messageData)
      .then(async (data) => {
        setAlertMessage("Mail sent Successfully");
        setCustomToast(true);
        setFeedbackSendBtnStatus(false);
        setLoading(false);
        setMessage("");
        setShow(false);
      }).catch((error) => {
        console.log(`Unable to sent mail. Error: ${error.toString()}, please try after some time.`, 'danger');
        setAlertMessage("Unable to send mail. Please try after sometime.");
        setCustomToast(true);
        setFeedbackSendBtnStatus(false);
        setLoading(false);
      });
  }
  return (
    <Modal className="modal-right" show={show} onHide={() => setShow(false)}>
      <Modal.Header>
        <Modal.Title>Please Enter Your Feedback</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <textarea
          id="message"
          name="message"
          type="textarea"
          className="form-control"
          style={{ height: '45em' }}
          onChange={handleChange}
          value={message}
        />
      </Modal.Body>
      <section className="scroll-section">
        <Toast className={alertMessage == "Mail sent Successfully" ? "mb-15 pl-2 align-items-center bg-success" : "mb-15 align-items-center bg-danger"} show={customToast}>
          <div className="d-flex w-auto">
            <Toast.Body><p className="text-warning">{alertMessage}</p></Toast.Body>
            <CloseButton className="me-2 m-auto" onClick={() => setCustomToast(false)} />
          </div>
        </Toast>
      </section>
      <Modal.Footer>
        <Button className="btn btn-primary" disabled={feedbackSendBtnStatus} onClick={(e) => sendFeedback()}>
          {feedbackSendBtnStatus ? (
            < div >
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Please wait..
            </div>
          ) : (
            'Send Feedback'
          )}
        </Button>
        <Button variant="secondary" onClick={() => closeFeedback()}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

  );
};

export default FeedbackModal;
