import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Button, Form, Alert } from "react-bootstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../auth/authSlice";
import { storeSession } from "../../lib/commonLib";

const Register = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [alertVariant, setalertVariant] = useState("");
  const [alertMessage, setalertMessage] = useState("");

  const showMessage = (strMsg, msgType) => {
    setalertVariant(msgType);
    setalertMessage(strMsg);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().required("Password is required"),
    terms: Yup.bool().required().oneOf([true], "Terms must be accepted"),
  });

  const initialValues = {
    name: "",
    email: "",
    password: "",
    terms: false,
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await fetch(`api/postData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();
      console.log('dataaaaa',data);

      if (response.ok) {
        let userObj = {
          email: values.email,
          name: values.name,
          session: data.session, // assuming your backend returns a session token
        };
        
        const loginState = {
          isAuthenticated: true,
          userEmail: values.email,
          userInfo: userObj,
        };
        
        storeSession(loginState);
        dispatch(setCurrentUser(userObj));

        showMessage("User registered successfully!", "success");
        history.push("/loginpage");
      } else {
        throw new Error(data.message || "Failed to register");
      }
    } catch (e) {
      showMessage(e.message, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  function renderForm() {
    return (
      <div style={{ textAlign: "-webkit-center" }}>
        <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 rounded">
          <div className="sw-lg-50 px-5">
            <div className="mb-5">
              <h2 className="cta-1 mb-0 text-primary">Welcome,</h2>
              <h2 className="cta-1 text-primary">
                let's get the ball rolling!
              </h2>
            </div>
            <div className="mb-5">
              <p className="h6">Please use the form to register.</p>
              <p className="h6">
                If you are a member, please{" "}
                <NavLink to="/loginpage">login</NavLink>.
              </p>
            </div>
            {alertMessage && (
              <Alert variant={alertVariant}>
                <strong>{alertMessage}</strong>
              </Alert>
            )}
            <form
              id="registerForm"
              className="tooltip-end-bottom"
              onSubmit={handleSubmit}
            >
              <div className="mb-3 filled form-group tooltip-end-top top-label">
                <Form.Control
                  type="text"
                  name="name"
                  placeholder=""
                  value={values.name}
                  onChange={handleChange}
                />
                <Form.Label style={{ backgroundColor: "transparent" }}>
                  Name
                </Form.Label>
                {errors.name && touched.name && (
                  <div className="d-block invalid-tooltip">{errors.name}</div>
                )}
              </div>
              <div className="mb-3 filled form-group tooltip-end-top top-label">
                <Form.Control
                  type="text"
                  name="email"
                  placeholder=""
                  value={values.email}
                  onChange={handleChange}
                />
                <Form.Label style={{ backgroundColor: "transparent" }}>
                  Email
                </Form.Label>
                {errors.email && touched.email && (
                  <div className="d-block invalid-tooltip">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-3 filled form-group tooltip-end-top top-label">
                <Form.Control
                  type="password"
                  name="password"
                  onChange={handleChange}
                  value={values.password}
                  placeholder=""
                />
                <Form.Label style={{ backgroundColor: "transparent" }}>
                  Password
                </Form.Label>
                {errors.password && touched.password && (
                  <div className="d-block invalid-tooltip">
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="mb-3 position-relative form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="terms"
                    onChange={handleChange}
                    value={values.terms}
                  />
                  <label className="form-check-label">
                    I have read and accept the{" "}
                    <NavLink to="/" target="_blank">
                      terms and conditions.
                    </NavLink>
                  </label>
                  {errors.terms && touched.terms && (
                    <div className="d-block invalid-tooltip">
                      {errors.terms}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                type="submit"
                isloading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Please wait..
                  </div>
                ) : (
                  "Signup"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <div>{renderForm()}</div>;
};

export default Register;
