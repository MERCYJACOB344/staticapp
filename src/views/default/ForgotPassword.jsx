import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';
import { CognitoUser } from 'amazon-cognito-identity-js';
import Pool from '../../views/default/Userpool';
import * as Yup from 'yup';
import CsLineIcons from '../../cs-line-icons/CsLineIcons';
import { debugLogger } from '../../lib/commonLib';

const ForgotPassword = () => {
  const title = 'Forgot Password';
  const description = 'Forgot Password Page';

  const validationSchema = Yup.object().shape({
    email: Yup.string().email().required('Email is required'),
  });
  const [stage, setStage] = useState(1); // 1 = email stage, 2 = code stage
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dismissingAlertShow, setDismissingAlertShow] = useState(false);
  const [alertVariant, setalertVariant] = useState('');
  const [alertMessage, setalertMessage] = useState('');
  const [resetBtnStatus, setResetBtnStatus] = useState(false);
  const [changeBtnStatus, setChangeBtnStatus] = useState(false);
  const history = useHistory();

  const getUser = () => {
    return new CognitoUser({
      Username: email.toLowerCase(),
      Pool,
    });
  };

  const sendCode = (event) => {
    event.preventDefault();
    setResetBtnStatus(true);
    getUser().forgotPassword({
      onSuccess: (data) => {
        //debugLogger('onSuccess:', data);
        setResetBtnStatus(false);
      },
      onFailure: (err) => {
        console.error('onFailure:', err);
        setDismissingAlertShow(true);
        setalertVariant('danger');
        setalertMessage('Email ID not found');
        setResetBtnStatus(false);
      },
      inputVerificationCode: (data) => {
        //debugLogger('Input code:', data);
        setStage(2);
        setResetBtnStatus(false);
      },
    });
  };

  const resetPassword = (event) => {
    event.preventDefault();
    setChangeBtnStatus(true);
    if (password !== confirmPassword) {
      console.error('Passwords are not the same');
      setDismissingAlertShow(true);
      setalertVariant('danger');
      setalertMessage('Passwords are not the same');
      setChangeBtnStatus(false);
      return;
    }
    var passwordRGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&/,><\’:;|_~`])\S{8,99}$/;
    if (!passwordRGEX.test(password)) {
      setDismissingAlertShow(true);
      setalertVariant('danger');
      setalertMessage('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
      setChangeBtnStatus(false);
      return;
    }
    if (code.trim() === '') {
      setDismissingAlertShow(true);
      setalertVariant('danger');
      setalertMessage('Confirmation code is blank');
      setChangeBtnStatus(false);
      return;
    }
    getUser().confirmPassword(code, password, {
      onSuccess: (data) => {
        //debugLogger('onSuccess:', data);
        setChangeBtnStatus(false);
        history.push('/loginpage');
      },
      onFailure: (err) => {
        console.error('onFailure:');
        console.log(err);
        let errorString = JSON.stringify(err);
        if (errorString.includes('CodeMismatchException')) {
          setDismissingAlertShow(true);
          setalertVariant('danger');
          setalertMessage('Invalid Confirmation Code');
          setChangeBtnStatus(false);
        } else if (errorString.includes('LimitExceededException')) {
          setDismissingAlertShow(true);
          setalertVariant('danger');
          setalertMessage('Password reset limit exceeded. Please try after some time');
          setChangeBtnStatus(false);
        } else {
          setDismissingAlertShow(true);
          setalertVariant('danger');
          setalertMessage('Failed to change password');
          setChangeBtnStatus(false);
        }
      },
    });
  };

  return (
    <div style={{ textAlign: '-webkit-center' }}>
      <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 rounded">
        <div className="sw-lg-50 px-5">
          <div className="mb-5">
            <h2 className="cta-1 mb-0 text-primary">Forgot Password?</h2>
            <h2 className="cta-1 text-primary">Let's reset it!</h2>
          </div>
          <div className="mb-5">
            <p className="h6">Please enter your email to receive a link and reset your password.</p>
            <p className="h6">
              If you are a member, please <NavLink to="/loginpage">login</NavLink>.
            </p>
          </div>
          {dismissingAlertShow && (
            <Alert variant={alertVariant} onClose={() => setDismissingAlertShow(false)} dismissible>
              <strong>{alertMessage}</strong>
            </Alert>
          )}
          <div>
            {stage === 1 && (
              <form id="forgotPasswordForm" className="tooltip-end-bottom" onSubmit={sendCode}>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="email" />
                  <Form.Control type="text" name="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                {/*<Button size="lg" type="submit">
                  Send Reset Email
            </Button>*/}
                <Button size="lg" type="submit" disabled={resetBtnStatus} >
                  {resetBtnStatus ? (
                    < div >
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Please wait..
                    </div>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
                <br />
                
              </form>
            )}
          </div>

          {stage === 2 && (
            <form id="forgotPassword" className="tooltip-end-bottom" onSubmit={resetPassword}>
              <div className="mb-3 filled form-group tooltip-end-top">
                <Form.Control type="text" name="code" placeholder="Enter Confirmation Code" value={code} onChange={(event) => setCode(event.target.value)} />
              </div>
              <div className="mb-3 filled form-group tooltip-end-top">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="mb-3 filled form-group tooltip-end-top">
                <Form.Control
                  type="password"
                  name="confirm password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <Form.Text id="passwordHelpBlock" muted>
                  Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special case character
                </Form.Text>
              </div>
              {/*<Button size="lg" type="submit">
                Change password
          </Button>*/}
              <Button size="lg" type="submit" disabled={changeBtnStatus} >
                {changeBtnStatus ? (
                  < div >
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Please wait..
                  </div>
                ) : (
                  'Change password'
                )}
              </Button>
              <br />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
