import React, { useEffect, useState } from "react";
import { useAppContext } from "../../lib/contextLib";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import BreadcrumbList from "../../components/breadcrumb-list/BreadcrumbList";
import { checkForValidSession, getParameterByName } from "../../lib/commonLib";
import { API, Auth } from "aws-amplify";
import { useLocation } from "react-router-dom";
import { s3Upload, s3FileCopy } from "../../lib/awsLib";
import InitiationFileUpload from "./component/InitiationFileUpload";
import { useSelector } from "react-redux";
import CsLineIcons from "../../cs-line-icons/CsLineIcons";
import { useDispatch } from "react-redux";
import {
  setProjects,
  updateProjectStatus,
  removeProject,
  addProject,
  updateProject,
} from "../dashboards/component/ProjectSlice";

const WorkRequestForm = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isAuthenticated } = useAppContext();
  const [workType, setWorkType] = useState([]);
  const [authorizers, setAuthorizers] = useState([]);
  const [requesters, setRequesters] = useState([]);
  const [designEngineers, setDesignEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editDocumentList, seteditDocumentList] = useState([]);
  const [addDocument, setaddDocument] = useState([]);
  const [saveBtnStatus, setSaveBtnStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissingAlertShow, setDismissingAlertShow] = useState(false);
  const [alertVariant, setalertVariant] = useState("");
  const [alertMessage, setalertMessage] = useState("");
  const { currentUser, isLogin } = useSelector((state) => state.auth);
  const uploadedEmail = currentUser.email;

  const showMessage = (strMsg, msgType = "info") => {
    setalertVariant(msgType);
    setalertMessage(strMsg);
  };

  let tmpAttachmentDocs = null;
  if (editDocumentList == null) {
    tmpAttachmentDocs = [];
  } else {
    tmpAttachmentDocs = editDocumentList;
  }

  const [title, setTitle] = useState("Add New Work Request");

  const [formData, setFormData] = React.useState({
    projectName: "",
    requesterId: "",
    contactNumber: "",
    workTypeId: "",
    workDescription: "",
    authorizerId: "",
    startDate: "",
    endDate: "",
    status: "",
    latitudeLongitude: "",
    workTickets: "",
    specialInstructions: "",
    designEngineerId: "",
    fileUpload: null,
    uploadAttachment: null,
  });

  if (!isAuthenticated) {
    checkForValidSession();
  }
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (location.state) {
      setIsEdit(true);
      const { editData } = location.state;
      getEditData(editData);
      setTitle("Edit Work Request");
    }
  }, [location.state]);

  const getEditData = async (editData) => {
    setIsLoading(true);
    const wo_id = editData.wo_id;


    try {
      
      const response = await fetch("/api/getAllWorkOrders");

      const data = await response.json();

      const filteredData = data.filter((order) => order.wo_id === wo_id);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

     
      let edtdta = filteredData[0];
      setFormData({
        projectName: edtdta.project_name,
        requesterId: edtdta.requested_by,
        contactNumber: edtdta.contact_number,
        workTypeId: edtdta.type_of_work,
        workDescription: edtdta.desc_of_work,
        authorizerId: edtdta.work_auth_by,
        startDate: formatDate(edtdta.start_date),
        endDate: formatDate(edtdta.end_date),
        status: edtdta.status,
        latitudeLongitude: edtdta.lat_long,
        workTickets: edtdta.work_tickets_req,
        specialInstructions: edtdta.special_instr,
        designEngineerId: edtdta.design_engineer,
        fileUpload: null,
        wo_id: edtdta.wo_id,
        uploadAttachment: edtdta.uploadattachments,
      });

      const updateTitle = (newTitle) => {
        setTitle(newTitle);
      };

      // seteditDocumentList(edtdta.uploadattachments);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to get data.Please try after some time.`);
      console.error("Error updating work order:", error);
    }
  };

  const handleSave = async () => {
    if (isEdit) {
      handleEditSave();
    } else {
      handleCreateSave();
    }
    //window.location.href = "../dashboards/DashboardsDefault";
  };
 
  const handleEditSave = async () => {
    setSaveBtnStatus(true);
    try {
      // if (addDocument) {
      //   let singleDocument = null;
      //   /* eslint-disable no-await-in-loop */
      //   for (let i = 0; i < addDocument.length; i += 1) {
      //     singleDocument = addDocument[i];
      //     if (singleDocument.adddocument !== null) {
      //       const docUploaded = await doFileUpload(
      //         singleDocument,
      //         uploadedEmail
      //       );
      //       const newDocument = {
      //         fileKey: docUploaded.fileKey,
      //         fileName: singleDocument.adddocument.name,
      //       };

      //       tmpAttachmentDocs.push(newDocument);
      //     }
      //   }

      //   formData.uploadAttachment = JSON.stringify(tmpAttachmentDocs);
      // }

      let updatedWorkOrder = formData;
   
      if (!validateContactNumber(formData.contactNumber)) {
        throw new Error("Invalid contact number. Please enter a valid contact number.");
      }
      if (!formData.workTickets ) {
        throw new Error(
          "No work tickets provided. Please enter at least one work ticket."
        );
       
      }

      console.log('updated work order',updatedWorkOrder);
      const response = await fetch(`/api/updateWorkRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedWorkOrder),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with status ${response.status}: ${errorText}`
        );
      }

      dispatch(updateProject(updatedWorkOrder));
      setShowSuccessModal(true);
      setSaveBtnStatus(false);
      handleClear();
    } catch (error) {
      setSaveBtnStatus(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to update data: ${error.message}`);
      console.error("Error saving work order:", error);
    }
  };
  const handleCreateSave = async () => {
    setIsEdit(false);
    setSaveBtnStatus(true);
    if (!validateContactNumber(formData.contactNumber)) {
      throw new Error("Invalid contact number. Please enter a valid contact number.");
    }
    if (!formData.workTickets) {
      throw new Error(
        "No work tickets provided. Please enter at least one work ticket."
      );
     
    }
    if (!formData.startDate){
      throw new Error(
        "Please provide starttdate"
      );
     
    }
    if (!formData.endDate){
      throw new Error(
        "Please provide end date"
      );
     
    }
    try {
      // if (addDocument) {
      //   let singleDocument = null;
      //   /* eslint-disable no-await-in-loop */
      //   for (let i = 0; i < addDocument.length; i += 1) {
      //     singleDocument = addDocument[i];
      //     if (singleDocument.adddocument !== null) {
      //       const docUploaded = await doFileUpload(
      //         singleDocument,
      //         uploadedEmail
      //       );
      //       const newDocument = {
      //         fileKey: docUploaded.fileKey,
      //         fileName: singleDocument.adddocument.name,
      //       };
      //       tmpAttachmentDocs.push(newDocument);
      //     }
      //   }
      //   formData.uploadAttachment = JSON.stringify(tmpAttachmentDocs);
      // }

      const response = await fetch(`/api/postInitiationWorkOrders`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with status ${response.status}: ${errorText}`
        );
      }
      dispatch(setProjects(formData));
      setShowSuccessModal(true);
      setSaveBtnStatus(false);
      handleClear();
    } catch (error) {
      setSaveBtnStatus(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to save data.Please try after some time.`);
      console.error("Error saving work order:", error);
    }
  };

  // documents upload
  // const handleDeleteDocument = (e) => {
  //   seteditDocumentList(e);
  // };
  // const uploadAttachment = (uploadAttachments) => {
  //   setaddDocument(uploadAttachments);
  // };

  // async function doFileUpload(singleDocument, uploadedEmail) {
  //   const fileControl = singleDocument.adddocument;
  //   const docUploaded = { s3SaveError: "", fileKey: "" };

  //   try {
  //     if (fileControl && fileControl.size > 26214400) {
  //       alert(`Please pick a file smaller than 25MB.`);
  //       docUploaded.s3SaveError = "Please pick a file smaller than 25MB";
  //       return docUploaded;
  //     }
  //     const attachment = fileControl
  //       ? await s3Upload(fileControl, uploadedEmail)
  //       : null;
  //     if (attachment != null) {
  //       docUploaded.fileKey = attachment;
  //     }
  //   } catch (error) {
  //     setDismissingAlertShow(true);
  //     setalertVariant("danger");
  //     setalertMessage(`Unable to upload File.Please try after some time.`);
  //     console.log('error in uploading file', error);
  //   }

  //   return docUploaded;
  // }

  const handleClear = () => {
    setFormData({
      projectName: "",
      requesterId: "",
      contactNumber: "",
      workTypeId: "",
      workDescription: "",
      authorizerId: "",
      startDate: "",
      endDate: "",
      status: "",
      latitudeLongitude: "",
      workTickets: "",
      specialInstructions: "",
      designEngineerId: "",
      fileUpload: null,
    });
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "contactNumber" && !validateContactNumber(value)) {
      setErrorMessage(
        "Invalid contact number. Please enter a valid contact number."
      );
    } else {
      setErrorMessage("");
    }
  };

  const handleFileChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      fileUpload: e.target.files[0],
    }));
  };

  const validateContactNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  async function getWorkType() {
    try {
      const response = await fetch("/api/getWorkType");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setWorkType(data);
    } catch (error) {
      setIsLoading(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to get worktype data. Please try again later.`);
      console.error(`Unable to get worktype. Error: ${error.toString()}`);
    }
  }

  async function getAuthorizers() {
    try {
      const response = await fetch("/api/getAuthorizers");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setAuthorizers(data);
    } catch (error) {
      setIsLoading(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(
        `Unable to get authorizers data. Please try again later.`
      );
      console.error(`Unable to get authorizers. Error: ${error.toString()}`);
    }
  }

  async function getRequesters() {
    try {
      const response = await fetch("/api/getRequesters");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setRequesters(data);
    } catch (error) {
      setIsLoading(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to get requesters data. Please try again later.`);
      console.error(`Unable to get requesters. Error: ${error.toString()}`);
    }
  }

  async function getDesignEngineers() {
    try {
      const response = await fetch("/api/getDesignEngineers");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setDesignEngineers(data);
    } catch (error) {
      setIsLoading(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(
        `Unable to get design engineers data. Please try again later.`
      );
      console.error(
        `Unable to get design engineers. Error: ${error.toString()}`
      );
    }
  }

  async function getStatuses() {
    try {
      const response = await fetch("/api/getStatuses");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      setIsLoading(false);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to get status data. Please try again later.`);
      console.error(`Unable to get statuses. Error: ${error.toString()}`);
    }
  }

  useEffect(() => {
    getWorkType();
    getAuthorizers();
    getRequesters();
    getDesignEngineers();
    getStatuses();
  }, []);

  return (
    <>
      <Row>
        <Col>
          <section className="scroll-section" id="title">
            <div className="page-title-container">
              <h1 className="mb-0 pb-0 display-4">{title}</h1>
              <br />
            </div>
          </section>
        </Col>
      </Row>
      {isLoading ? (
        <div className="text-center" style={{ marginTop: `200px` }}>
          <Spinner animation="border" variant="primary" />
          <p> Loading...</p>
        </div>
      ) : (
        <div>
          <Row>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  {dismissingAlertShow && (
                    <Alert
                      variant={alertVariant}
                      onClose={() => setDismissingAlertShow(false)}
                      dismissible
                    >
                      <strong>{alertMessage}</strong>
                    </Alert>
                  )}
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Project Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Project Name"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Requested By</Form.Label>
                      <Form.Control
                        as="select"
                        name="requesterId"
                        value={formData.requesterId}
                        onChange={handleChange}
                      >
                        <option>Select Requestor</option>
                        {requesters.map((requester, index) => (
                          <option key={index} value={requester.requester_id}>
                            {requester.client_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Contact Number"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                      />
                      {errorMessage && (
                        <Form.Text className="text-danger">
                          {errorMessage}
                        </Form.Text>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Type of Work</Form.Label>
                      <Form.Control
                        as="select"
                        name="workTypeId"
                        value={formData.workTypeId}
                        onChange={handleChange}
                      >
                        <option>Select Work Classification</option>
                        {workType.map((classification, index) => (
                          <option key={index} value={classification.work_type}>
                            {classification.work_type}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description of Work</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter Description of Work"
                        name="workDescription"
                        value={formData.workDescription}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Work Authorized By</Form.Label>
                      <Form.Control
                        as="select"
                        name="authorizerId"
                        value={formData.authorizerId}
                        onChange={handleChange}
                      >
                        <option>Select Authorizer</option>
                        {authorizers.map((authorizer, index) => (
                          <option key={index} value={authorizer.authorizer_id}>
                            {authorizer.user_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Control
                        as="select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option>Select Status</option>
                        {statuses.map((status, index) => (
                          <option key={index} value={status.status_name}>
                            {status.status_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Latitude / Longitude</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter in the format latitude,longitude"
                        name="latitudeLongitude"
                        value={formData.latitudeLongitude}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Work Tickets</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter Number of Work Tickets"
                        name="workTickets"
                        value={formData.workTickets}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Special Instructions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter Special Instructions"
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Design Engineer</Form.Label>
                      <Form.Control
                        as="select"
                        name="designEngineerId"
                        value={formData.designEngineerId}
                        onChange={handleChange}
                      >
                        <option>Select Design Engineer</option>
                        {designEngineers.map((engineer, index) => (
                          <option key={index} value={engineer.engineer_id}>
                            {engineer.user_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* <Row className="justify-content-center mt-4">
            <Col md={8}>
              <Card className="h-100" style={{ overflow: 'hidden' }}>
                <Card.Body>
                  <div style={{ width: '350%' }}>
                    <InitiationFileUpload
                      documentDeleteHandler={handleDeleteDocument}
                      uploadAttachment={uploadAttachment}
                      editDocumentList={editDocumentList}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row> */}
          <Row className="justify-content-center mt-4">
            <Col md={8} className="text-center">
              <Button
                id="saveBtn"
                variant="primary"
                disabled={saveBtnStatus}
                className="me-2"
                onClick={handleSave}
              >
                {saveBtnStatus ? (
                  <div>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving..
                    <CsLineIcons icon="save" />
                  </div>
                ) : (
                  <div>
                    <span>Save</span>
                    <CsLineIcons icon="save" />
                  </div>
                )}
              </Button>
              {/* <Button variant="primary" onClick={handleSave} className="me-2">
                          Save
                        </Button> */}
              <Button variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            </Col>
          </Row>
          <Modal
            show={showSuccessModal}
            onHide={() => setShowSuccessModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Success</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {" "}
              {isEdit
                ? "Contract Updated Successfully"
                : "Contract Created Successfully"}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export default WorkRequestForm;
