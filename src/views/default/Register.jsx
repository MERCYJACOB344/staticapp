import React, { useEffect, useState, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { Button, Form, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import { useFormik } from "formik";
import { API, Auth } from "aws-amplify";
import { onError } from "../../lib/errorLib";
import { useAppContext } from "../../lib/contextLib";
import LayoutFullpage from "../../layout/LayoutFullpage";
import CsLineIcons from "../../cs-line-icons/CsLineIcons";
import HtmlHead from "../../components/html-head/HtmlHead";
import { getCognitoUserList } from "../../lib/awsLib";
import { USER_ROLE } from "../../constants.jsx";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../auth/authSlice";
import { storeSession, debugLogger } from "../../lib/commonLib";

const Register = () => {
  const title = "Register";
  const description = "Register Page";

  const history = useHistory();
  const dispatch = useDispatch();
  const [newUser, setNewUser] = useState(null);
  const { userHasAuthenticated ,userEmail} = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [userSetUp, setUserSetup] = useState();
  const [dismissingAlertShow, setDismissingAlertShow] = useState(false);
  const [registerBtnStatus, setRegisterBtnStatus] = useState(false);

  const [alertVariant, setalertVariant] = useState("");
  const [alertMessage, setalertMessage] = useState("");

  // const nav = useNavigate();

  const showMessage = (strMsg, msgType) => {
    setalertVariant(msgType);
    setalertMessage(strMsg);
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email().required("Email is required"),
    terms: Yup.bool().required().oneOf([true], "Terms must be accepted"),
  });

  const initialValues = {
    name: "",
    email: "",
    password: "",
    terms: false,
    confirmationCode: "",
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    setRegisterBtnStatus(true);
    try {
      const newUsers = await Auth.signUp({
        name: values.name,
        username: values.email,
        password: values.password,
      });
      setIsLoading(false);
      setalertMessage("");
      setRegisterBtnStatus(false);
      setNewUser(newUsers);
    } catch (e) {
      setDismissingAlertShow(true);
      showMessage(e.message, "danger");
      setRegisterBtnStatus(false);
      //console.log("error occured")
      //onError(e);
      setIsLoading(false);
    }
  };
  async function saveUser(userData) {
    setalertMessage("");
    const newUserData = {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },

      body: userData,
    };
    API.post("fieldsurvey", `/userinfo`, newUserData)
      .then(async (data) => {
        alert("User Registered Successfully");
        setRegisterBtnStatus(false);
        let userObj = {
          role: USER_ROLE.User,
          email: data.email,
          approved: true,
        };
        const loginState = {
          isAuthenticated: true,
          userEmail,
          userInfo: userObj,
        };
        storeSession(loginState);
        dispatch(setCurrentUser(userObj));
        userHasAuthenticated(true);

        setIsLoading(false);
        history.push("/loginpage");
      })
      .catch((error) => {
        showMessage(
          "Unable to save the User data. Please try after some time.",
          "danger"
        );
        setRegisterBtnStatus(false);
        console.log(
          `Unable to save the User data. Error: ${error.toString()}, please try after some time.`,
          "danger"
        );
      });
  }

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  function validateConfirmationForm() {
    return values.confirmationCode.length > 0;
  }

  const handleConfirmationSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await Auth.confirmSignUp(values.email, values.confirmationCode);
      await Auth.signIn(values.email, values.password);
      const userData = {
        name: values.name,
        email: values.email,
      };
      //saveUser(userData);
      setalertMessage("user registered successfully");
      setIsLoading(false);
    
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  };

  function renderConfirmationForm() {
    return (
      <div>
        {alertMessage != "" ? (
          <Alert variant={alertVariant}>
            <strong>{alertMessage}</strong>
          </Alert>
        ) : null}
        {/*<Alert variant={alertVariant} hidden={alertMessage === ''}>
          {alertMessage}
      </Alert>*/}
        <Form onSubmit={handleConfirmationSubmit}>
          <Form.Group controlId="confirmationCode" size="lg">
            <Form.Label>Confirmation Code</Form.Label>
            <Form.Control
              autoFocus
              type="tel"
              onChange={handleChange}
              value={values.confirmationCode}
            />
            <Form.Text muted>Please check your email for the code.</Form.Text>
          </Form.Group>
          <Button
            block="true"
            size="lg"
            type="submit"
            variant="success"
            isloading={isLoading}
            disabled={!validateConfirmationForm()}
          >
            Verify
          </Button>
        </Form>
      </div>
    );
  }

  function renderForm() {
    return (
      <div style={{ textAlign: "-webkit-center" }}>
        <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 rounded">
          <div className="sw-lg-50 px-5">
            {/* <div className="sh-11">
        <NavLink to="/">
          <div className="logo-default" />
        </NavLink>
      </div> */}
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
            <div>
              {dismissingAlertShow && (
                <Alert
                  variant={alertVariant}
                  onClose={() => setDismissingAlertShow(false)}
                  dismissible
                >
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
                {/*<Button size="lg" type="submit" isloading={isLoading}>
                  Signup
              </Button>*/}
                <Button
                  size="lg"
                  type="submit"
                  isloading={isLoading}
                  disabled={registerBtnStatus}
                >
                  {registerBtnStatus ? (
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
      </div>
    );
  }
  return (
    <div>{newUser === null ? renderForm() : renderConfirmationForm()}</div>
  );
};

export default Register;
