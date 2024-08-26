import React, { useState } from 'react';
import { useAppContext } from '../../lib/contextLib';
import { checkForValidSession, storeSession, getLocalStorage, handleValueChange } from '../../lib/commonLib';
import { Form, Col, Button, Row, Alert, Toast, CloseButton } from 'react-bootstrap';
import CsLineIcons from '../../cs-line-icons/CsLineIcons';
import { API, Auth } from 'aws-amplify';
import { s3Upload, getStorage } from '../../lib/awsLib';

const SettingsPage = ({ messageHandler = () => { } }) => {
  const { isAuthenticated } = useAppContext();
  const { userEmail } = useAppContext();
  const uasUser = useAppContext();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState();
  const [faaNumber, setFaaNumber] = useState();
  const [latestTestDate, setLatestTestDate] = useState();
  const [originalTestDate, setOriginalTestDate] = useState();
  const [addDocumentCount, setaddDocumentCount] = useState([{ adddocument: null, index: 0 }]);
  const [projectDocuments, setprojectDocuments] = useState([]);
  const [fcrApprovalReminderNoticeDays, setfcrApprovalReminderNoticeDays] = useState();
  const [deleteFlag, setdeleteFlag] = useState(false);
  const [updateIsLoading, setUpdateIsLoading] = useState(false);
  const [customToast, setCustomToast] = useState(false);
  const [userAlerts, setuserAlerts] = useState({
    fcrApproved: false,
    fcrCommentReceived: false,
    fcrOnholdCancelled: false,
    fcrReviewingUpdated: false,
    fcrReviewingOnholdCancelled: false,
    pendingFCRClosetoFlightDate: false,
  });
  const [alertEmail, setAlertEmail] = useState(false);
  const [alertVariant, setalertVariant] = useState('');
  const [alertMessage, setalertMessage] = useState('');

  const showMessage = (strMsg, msgType = 'info') => {
    setalertVariant(msgType);
    setalertMessage(strMsg);
  };
  const addDocumentClick = () => {
    setaddDocumentCount([...addDocumentCount, { adddocument: null, index: addDocumentCount.length + 1 }]);
  };
  const documentRemove = (index) => {
    const list = [...addDocumentCount];
    list.splice(index, 1);
    setaddDocumentCount(list);
  };
  // Download the document
  const handleDownload = async (item) => {
    const result = await API.post('UASDashboard', `/transfer/download`, {
      body: {
        email: item.uploadedEmail,
        fileKey: item.fileKey,
      },
      headers: {
        Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
      },
    });
    const linkDownload = JSON.parse(result.body).url;

    fetch(linkDownload).then((response) => {
      response.blob().then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.fileName;
        a.click();
      });
    });
  };
  const handleAlertChange = async (item) => {
    handleValueChange(item, setuserAlerts, userAlerts);
  };
  function getUserAlerts() {
    const alerts = [];
    if (userAlerts.fcrApproved) {
      alerts.push('FCR is approved');
    }
    if (userAlerts.fcrCommentReceived) {
      alerts.push('FCR I am pilot on receives comments');
    }
    if (userAlerts.fcrOnholdCancelled) {
      alerts.push('FCR I am pilot on is placed on hold/canceled');
    }
    if (userAlerts.fcrReviewingUpdated) {
      alerts.push('FCR I am reviewing has been updated');
    }
    if (userAlerts.fcrReviewingOnholdCancelled) {
      alerts.push('FCR I am reviewing is placed on hold/canceled');
    }
    if (userAlerts.pendingFCRClosetoFlightDate) {
      alerts.push('Pending FCR is Close to Flight Date');
    }
    return alerts;
  }
  function prepareAlertData(tempAlerts) {
    const alertsData = {};
    if (tempAlerts === undefined) {
      alertsData.fcrApproved = true;
      alertsData.fcrCommentReceived = true;
      alertsData.fcrOnholdCancelled = true;
      alertsData.fcrReviewingUpdated = true;
      alertsData.fcrReviewingOnholdCancelled = true;
      alertsData.pendingFCRClosetoFlightDate = true;
    } else {
      tempAlerts ?.map((item) => {
        if (item === 'FCR is approved') {
          alertsData.fcrApproved = true;
        } else if (item === 'FCR I am pilot on receives comments') {
          alertsData.fcrCommentReceived = true;
        } else if (item === 'FCR I am pilot on is placed on hold/canceled') {
          alertsData.fcrOnholdCancelled = true;
        } else if (item === 'FCR I am reviewing has been updated') {
          alertsData.fcrReviewingUpdated = true;
        } else if (item === 'FCR I am reviewing is placed on hold/canceled') {
          alertsData.fcrReviewingOnholdCancelled = true;
        } else if (item === 'Pending FCR is Close to Flight Date') {
          alertsData.pendingFCRClosetoFlightDate = true;
        }
      });
    }
    return alertsData;
  }
  const changeAlertEmail = (event) => {
    if (event.target.checked) {
      setAlertEmail(event.target.value);
    }
  };
  const handleprojectDocumentChange = (event, index) => {
    [addDocumentCount[index].adddocument] = event.target.files;
  };
  async function doFileUpload(singleDocument) {
    const fileControl = singleDocument.adddocument;
    const docUploaded = { s3SaveError: '', fileKey: '' };
    try {
      if (fileControl && fileControl.size > 26214400) {
        alert(`Please pick a file smaller than 25MB.`);
        docUploaded.s3SaveError = 'Please pick a file smaller than 25MB';
        return docUploaded;
      }
      const attachment = fileControl ? await s3Upload(fileControl, email) : null;
      if (attachment != null) {
        docUploaded.fileKey = attachment;
      }
    } catch (err) {
      console.log(err);
    }

    return docUploaded;
  }

  const handleDelete = (item) => {
    setdeleteFlag(true);
    const indexvalue = projectDocuments.findIndex((element, index) => {
      if (element.fileKey.includes(item.fileKey)) {
        return true;
      }
      return false;
    });
    let tmpProjectDocs = null;
    projectDocuments.splice(indexvalue, 1);

    // to delete from UI
    let editdoc = projectDocuments.filter((items) => items.fileName !== item.fileName);

    if (projectDocuments == null) {
      tmpProjectDocs = [];
    } else {
      tmpProjectDocs = projectDocuments;
    }
    setprojectDocuments(editdoc);
  };

  const onUpdate = async (e) => {
    e.preventDefault();

    setUpdateIsLoading(true);
    const localUasUser = getLocalStorage('uasUser', 'no local storage');
    if (localUasUser !== 'no local storage') {
      localUasUser.userInfo.name = name;
    }
    const userObj = localUasUser.userInfo;
    userObj.name = name;
    userObj.company = company;
    userObj.location = location;
    userObj.secondaryEmail = secondaryEmail;
    userObj.phoneNumber = phoneNumber;
    userObj.latestTestDate = latestTestDate;
    userObj.originalTestDate = originalTestDate;
    userObj.fcrApprovalReminderNoticeDays = fcrApprovalReminderNoticeDays;
    const alerts = getUserAlerts();
    userObj.alerts = alerts;
    userObj.alertEmail = alertEmail;
    if (alerts.includes("Pending FCR is Close to Flight Date") && (isNaN(fcrApprovalReminderNoticeDays) || fcrApprovalReminderNoticeDays <= 0)) {
      setCustomToast(true);
      setUpdateIsLoading(false);
      return false;
    }
    let tmpProjectDocs = null;
    if (projectDocuments == null) {
      tmpProjectDocs = [];
    } else {
      tmpProjectDocs = projectDocuments;
    }
    let s3SaveError = '';

    let docUploaded = null;
    let singleDocument = null;
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < addDocumentCount.length; i += 1) {
      singleDocument = addDocumentCount[i];
      docUploaded = await doFileUpload(singleDocument);
      if (docUploaded.s3SaveError === '' && docUploaded.fileKey !== '') {
        const newDocument = {
          uploadedEmail: userEmail,
          fileKey: docUploaded.fileKey,
          fileName: singleDocument.adddocument.name,
          fileType: singleDocument.adddocument.type,
        };
        tmpProjectDocs.push(newDocument);
      } else {
        s3SaveError += docUploaded.s3SaveError;
      }
    }
    setprojectDocuments(tmpProjectDocs);
    userObj.projectDocuments = tmpProjectDocs;



    const updateUserData = {
      headers: {
        Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
      },
      body: {
        fcrData: userObj,
      },
    };
    await API.post('UASDashboard', '/fcr/updateUser', updateUserData)
      .then((data) => {
        setUpdateIsLoading(false);
        showMessage('User information updated successfully', 'success');
        storeSession(localUasUser);
      })
      .catch((error) => {
        console.log(`Unable to update the user information. Error: ${error.toString()}, please try after some time.`, 'danger');
        showMessage('Unable to update the user information. Please try after sometime', 'danger');
        setUpdateIsLoading(false);
      });
    /* I believe we will want  to add in an if statement
     to properly update the userId/email. Right now email will not be adjusted 
     */
  };

  if (!isAuthenticated) {
    /* there seems to be an overlying issue with this checkForValidSession function. 
    may want to open a ticket to investigate 
    (issue with react hook order and rendering, error shows wherever used ) */
    checkForValidSession();
  }

  React.useEffect(() => {
    const uasUser = getLocalStorage('uasUser', 'no local storage');
    const userInfo = uasUser.userInfo;
    setName(userInfo.name);
    setEmail(userInfo.email);
    setCompany(userInfo.company);
    setLocation(userInfo.location);
    setSecondaryEmail(userInfo.secondaryEmail);
    setPhoneNumber(userInfo.phoneNumber);
    setFaaNumber(userInfo.faaNumber);
    setLatestTestDate(userInfo.latestTestDate);
    setOriginalTestDate(userInfo.originalTestDate);
    setprojectDocuments(userInfo.projectDocuments);
    setuserAlerts(prepareAlertData(userInfo.alerts));
    setAlertEmail(userInfo.alertEmail !== undefined ? userInfo.alertEmail : userInfo.email);
    setfcrApprovalReminderNoticeDays(userInfo.fcrApprovalReminderNoticeDays !== undefined ? userInfo.fcrApprovalReminderNoticeDays : 3)
  }, []);

  return (
    <div id="root">
      <main style={{ padding: '20px' }}>
        <div className="container">
          <div className="row">
            <div className="col-auto d-none d-lg-flex">
              <div className="nav flex-column sw-25 mt-n2" id="settingsColumn">
                <div className="mb-2">
                  <a className="nav-link active px-0">
                    <i data-acorn-icon="activity" className="me-2" data-acorn-size="17" />
                    <span className="align-middle">Profile</span>
                  </a>
                  <div>
                    <a className="nav-link active py-1 my-1 px-0" href="">
                      <i className="me-2 sw-2 d-inline-block" />
                      <span className="align-middle">Personal</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <Col>
              {/* <!-- Title and Top Buttons Start --> */}
              <div className="page-title-container">
                <div className="row">
                  {/* <!-- Title Start --> */}
                  <div className="col">
                    <h1 className="mb-0 pb-0 display-4" id="title">
                      Profile
                    </h1>
                  </div>
                  {/* <!-- Title End --> */}
                </div>
              </div>
              {/* <!-- Title and Top Buttons End --> */}

              {/* <!-- Public Info Start --> */}
              <h2 className="small-title">Public Info</h2>
              <div className="card mb-5">
                <div className="card-body">
                  <form>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Name
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="name">
                          <Form.Control
                            value={name}
                            as="textarea"
                            onChange={(e) => {
                              setUserName(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Company
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="company">
                          <Form.Control
                            value={company}
                            as="textarea"
                            onChange={(e) => {
                              setCompany(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Location
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="location">
                          <Form.Control
                            value={location}
                            as="textarea"
                            onChange={(e) => {
                              setLocation(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Email
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="email">
                          <Form.Control value={email} as="textarea" disabled />
                        </Form.Group>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* <!-- Public Info End --> */}

              <h2 className="small-title">Contact</h2>
              <div className="card mb-5">
                <div className="card-body">
                  <form>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Secondary Email
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="secondaryEmail">
                          <Form.Control
                            value={secondaryEmail}
                            as="textarea"
                            onChange={(e) => {
                              setSecondaryEmail(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Phone
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="phoneNumber">
                          <Form.Control
                            value={phoneNumber}
                            as="textarea"
                            onChange={(e) => {
                              setPhoneNumber(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* <!-- Contact End --> */}
              {/* <!-- Pilot info Start --> */}
              <h2 className="small-title">Pilot Info</h2>
              <div className="card mb-5">
                <div className="card-body">
                  <form>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        FAA#
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="faaNumber">
                          <Form.Control value={faaNumber} as="textarea" disabled />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Original Certification Date
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="originalTestDate">
                          <Form.Control
                            type="date"
                            value={originalTestDate}
                            onChange={(e) => {
                              setOriginalTestDate(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Latest Recertification Date
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form.Group controlId="latestTestDate">
                          <Form.Control
                            type="date"
                            value={latestTestDate}
                            onChange={(e) => {
                              setLatestTestDate(e.target.value);
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="label">DOCUMENTS UPLOADED</h5>
                      <br />
                      {projectDocuments && projectDocuments.length === 0 ? (
                        <div>
                          <p>No files uploaded </p>
                        </div>
                      ) : (
                          <div>
                            <div className="row g-0 h-100 align-content-center mb-2 custom-sort d-none d-sm-flex">
                              <div className="col-sm-2 d-flex align-items-center">File Name</div>
                            </div>
                            {deleteFlag ? (
                              <div>
                                {projectDocuments ?.map((item, index) => (
                                  <div id="href-link" className="list scroll-out" key={index}>
                                    <div className="scroll-by-count" data-count="5" data-childselector=".scroll-child">
                                      <div className="h-auto sh-sm-5 mb-3 mb-sm-0 scroll-child">
                                        <div className="row g-0 h-100 align-content-center">
                                          <div className="col-sm-4 d-flex align-items-center">
                                            <a href="#href-link" className="body-link" onClick={(e) => handleDownload(item)}>
                                              {item.fileName}
                                            </a>
                                          </div>

                                          <div className="col-sm-2  d-flex">
                                            <Button variant="outline-primary" onClick={(e) => handleDelete(item)}>
                                              Delete
                                          </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                                <div>
                                  {projectDocuments ?.map((item, index) => (
                                    <div id="href-link" className="list scroll-out" key={index}>
                                      <div className="scroll-by-count" data-count="5" data-childselector=".scroll-child">
                                        <div className="h-auto sh-sm-5 mb-3 mb-sm-0 scroll-child">
                                          <div className="row g-0 h-100 align-content-center">
                                            <div className="col-sm-4 d-flex align-items-center">
                                              <a href="#href-link" className="body-link" onClick={(e) => handleDownload(item)}>
                                                {item.fileName}
                                              </a>
                                            </div>
                                            <div className="col-sm-2 d-grid gap-2 d-flex align-items-center "></div>
                                            <div className="col-sm-2  d-flex">
                                              <Button variant="outline-primary" onClick={(e) => handleDelete(item)}>
                                                Delete
                                          </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                    <div className="mb-3 row">
                      <label id="contact-form-label" className="col-lg-2 col-md-3 col-sm-4 col-form-label">
                        Attachment
                      </label>
                      <div className="col-sm-8 col-md-9 col-lg-10">
                        <Form>
                          {/* <h5 className="label">UPLOAD ATTACHMENTS</h5> */}
                          {addDocumentCount.map((singleDocument, index) => (
                            <div key={index} className="documentupload">
                              <Row>
                                <Col>
                                  <Form.Group controlId={`formFile_${index}`} className="mb-3">
                                    <Form.Control
                                      type="file"
                                      accept=".pdf,.docx,.jpg,.jpeg,.png,.msg,.xlsx"
                                      onChange={(e) => handleprojectDocumentChange(e, index, singleDocument)}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col>
                                  {addDocumentCount.length !== 1 && (
                                    <div>
                                      <Button onClick={() => documentRemove(index)} variant="secondary">
                                        Remove
                                      </Button>
                                    </div>
                                  )}
                                </Col>

                                <Col>
                                  {addDocumentCount.length - 1 === index && addDocumentCount.length < 5 && (
                                    <Button onClick={addDocumentClick} variant="foreground-alternate">
                                      <CsLineIcons icon="plus" /> <span>ADD NEW DOCUMENT</span>
                                    </Button>
                                  )}
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </Form>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* <!-- Pilot Info End --> */}
              {/* <!-- Alert info Start --> */}
              <h2 className="small-title">Alerts</h2>
              <div className="card mb-5">
                <div className="card-body">
                  <form>
                    <div className="mb-3 row">
                      <div className="col-sm-2 col-md-2 col-lg-3">
                        <h5 className="label">Alert me when</h5>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-8 col-md-9 col-lg-10">
                          <Form.Check
                            type="checkbox"
                            label="FCR is approved"
                            name="fcrApproved"
                            checked={userAlerts.fcrApproved}
                            onChange={handleAlertChange}
                          />
                        </div>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-8 col-md-9 col-lg-10">
                          <Form.Check
                            type="checkbox"
                            label="FCR I am pilot on receives comments"
                            name="fcrCommentReceived"
                            checked={userAlerts.fcrCommentReceived}
                            onChange={handleAlertChange}
                          />
                        </div>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-8 col-md-9 col-lg-10">
                          <Form.Check
                            type="checkbox"
                            label="FCR I am pilot on is placed on hold/canceled"
                            name="fcrOnholdCancelled"
                            checked={userAlerts.fcrOnholdCancelled}
                            onChange={handleAlertChange}
                          />
                        </div>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-8 col-md-9 col-lg-10">
                          <Form.Check
                            type="checkbox"
                            label="FCR I am reviewing has been updated"
                            name="fcrReviewingUpdated"
                            checked={userAlerts.fcrReviewingUpdated}
                            onChange={handleAlertChange}
                          />
                        </div>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-8 col-md-9 col-lg-10">
                          <Form.Check
                            type="checkbox"
                            label="FCR I am reviewing is placed on hold/canceled"
                            name="fcrReviewingOnholdCancelled"
                            checked={userAlerts.fcrReviewingOnholdCancelled}
                            onChange={handleAlertChange}
                          />
                        </div>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-8 col-md-9 col-lg-10">
                          <Form.Check
                            type="checkbox"
                            label="Pending FCR is Close to Flight Date"
                            name="pendingFCRClosetoFlightDate"
                            checked={userAlerts.pendingFCRClosetoFlightDate}
                            onChange={handleAlertChange}
                          />
                        </div>
                      </div>
                      {/* </div> */}
                    </div>

                    <div className="mb-3 row">
                      <div className="col-sm-2 col-md-2 col-lg-3">
                        <h5 className="label">Alert Mail To</h5>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-4 col-md-4 col-lg-4">
                          <Form.Check
                            type="radio"
                            label={email}
                            value={email}
                            name="alertMailRadio"
                            checked={alertEmail === email}
                            onChange={changeAlertEmail}
                          />
                        </div>
                      </div>
                      {secondaryEmail &&
                        <div className="mb-1 row">
                          <div className="col-sm-4 col-md-4 col-lg-4">
                            <Form.Check
                              type="radio"
                              label={secondaryEmail}
                              value={secondaryEmail}
                              name="alertMailRadio"
                              checked={alertEmail === secondaryEmail}
                              onChange={changeAlertEmail}
                            />
                          </div>
                        </div>
                      }

                    </div>
                    <div className="mb-3 row">
                      <div className="col-sm-4 col-md-4 col-lg-4" style={{ valign: 'bottom' }}>
                        <h5 className="label" style={{ valign: 'bottom' }}>Reminder Notification days for FCR Approval</h5>
                      </div>
                      <div className="mb-1 row">
                        <div className="col-sm-4 col-md-4 col-lg-4">
                          <Form.Group controlId="fcrApprovalReminderNoticeDays">
                            <Form.Control value={fcrApprovalReminderNoticeDays} as="textarea" onChange={(e) => {
                              setfcrApprovalReminderNoticeDays(e.target.value);
                            }} />
                          </Form.Group>
                        </div>
                        <section className="scroll-section">
                          <Toast className="mb-15 align-items-center bg-warning" show={customToast}>
                            <div className="d-flex w-auto">
                              <Toast.Body><b>Reminder Notification days for FCR Approval should be a valid number</b></Toast.Body>
                              <CloseButton className="me-2 m-auto" onClick={() => setCustomToast(false)} />
                            </div>
                          </Toast>
                        </section>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* <!-- Alert info End --> */}

              <Alert variant={alertVariant} hidden={alertMessage === ''}>
                {alertMessage}
              </Alert>
            </Col>
            <div className="col-sm-8 col-md-9 col-lg-10" style={{ marginLeft: '225px' }}>
              <Button className="btn btn-lg btn-primary" disabled={updateIsLoading} style={{ marginRight: '20px' }} onClick={onUpdate}>
                {updateIsLoading ? (
                  <div>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Updating please wait..
                  </div>
                ) : (
                    'Update'
                  )}
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default React.memo(SettingsPage);
