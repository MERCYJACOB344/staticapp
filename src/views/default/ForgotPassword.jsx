import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CsLineIcons from '../../cs-line-icons/CsLineIcons';

const ForgotPassword = () => {
  const title = 'Forgot Password';
  const description = 'Forgot Password Page';

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  });

  const [dismissingAlertShow, setDismissingAlertShow] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isEnableLogin, setIsEnableLogin] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const { email, password, confirmPassword } = values;

      // Handle form submission
      if (password !== confirmPassword) {
        setAlertVariant('danger');
        setAlertMessage('Passwords do not match');
        setDismissingAlertShow(true);
        return;
      }

      const requestBody = { email, password };

      try {
        setIsEnableLogin(true);
        const response = await fetch(`/api/updatePassword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        setAlertVariant('success');
        setAlertMessage('Password updated successfully');
        setDismissingAlertShow(true);
      } catch (error) {
        setAlertVariant('danger');
        setAlertMessage(`Error: ${error.message}`);
        setDismissingAlertShow(true);
      } finally {
        setIsEnableLogin(false);
        values.email = '';
        values.password = '';
        values.confirmPassword = '';
      }
    }
  });

  return (
    <div style={{ textAlign: "-webkit-center" }}>
      <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 rounded">
        <div className="sw-lg-50 px-5">
          <div className="mb-5">
           
            <h2 className="cta-1 text-primary">Reset Password</h2>
          </div>

          <div className="mb-5">
           
            <p className="h6">
              Navigate to login page, please{" "}
              <NavLink to="/loginpage">login</NavLink>.
            </p>
          </div>
          {dismissingAlertShow && (
            <Alert
              variant={alertVariant}
              onClose={() => setDismissingAlertShow(false)}
              dismissible
            >
              <strong>{alertMessage}</strong>
            </Alert>
          )}

          <div>
            <form
              id="loginForm"
              className="tooltip-end-bottom"
              onSubmit={formik.handleSubmit}
            >
              <div className="mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="email" />
                <Form.Control
                  type="text"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Email"
                  isInvalid={formik.touched.email && formik.errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.email}
                </Form.Control.Feedback>
              </div>
              <div className="mb-3 filled form-group tooltip-end-top ">
                <CsLineIcons icon="lock-off" />
                <Form.Control
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Password"
                  isInvalid={formik.touched.password && formik.errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.password}
                </Form.Control.Feedback>
              </div>
              <div className="mb-3 filled form-group tooltip-end-top ">
                <CsLineIcons icon="lock-off" />
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirm Password"
                  isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.confirmPassword}
                </Form.Control.Feedback>
              </div>
              <Button size="lg" type="submit" disabled={isEnableLogin}>
                {isEnableLogin ? (
                  <div>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating..
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
