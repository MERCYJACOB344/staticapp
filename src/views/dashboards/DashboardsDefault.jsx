import React, { useState, useRef } from "react";
import {
  Card,
  Col,
  Row,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import CsLineIcons from "../../cs-line-icons/CsLineIcons";
import DashboardTaskManagement from "../dashboards/component/DashboardTaskManagement";
import DashboardAnalysis from "../dashboards/component/DashboardAnalysis";
import { useAppContext } from "../../lib/contextLib";
import { checkForValidSession, getParameterByName } from "../../lib/commonLib";
import { API, Auth } from "aws-amplify";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch } from 'react-redux';
import { setProjects,updateProjectStatus,removeProject,addProject} from "./component/ProjectSlice";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const DashboardsPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAppContext();
  const [submittedProjectDetails, setSubmittedProjectDetails] = useState([]);
  const [inProgressProjectDetails, setInProgressProjectDetails] = useState([]);
  const [qaProjectDetails, setQAProjectDetails] = useState([]);
  const [completedProjectDetails, setCompletedProjectDetails] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const [projectDetails, setProjectDetails] = useState([]);
  const [addTask, setAddTask] = React.useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [allProjectDetails, setAllProjectDetails] = useState([]);
  const [uniqueId, setUniqueId] = useState();
  const [isloading, setIsLoading] = useState(true);
  const [dismissingAlertShow, setDismissingAlertShow] = useState(false);
  const [alertVariant, setalertVariant] = useState("");
  const [alertMessage, setalertMessage] = useState("");
  const [addTaskValidation, setAddTaskValidation] = useState(false);
  const headingRef = useRef(null);

  const [formData, setFormData] = React.useState({
    project_name: "",
    desc_of_work: "",
    start_date: "",
    status: "",
    wo_id: "",
    end_date: "",
  });

  const showMessage = (strMsg, msgType = "info") => {
    setalertVariant(msgType);
    setalertMessage(strMsg);
  };

  const handleDelete = (deletedProject, status) => {
    console.log('delete',deletedProject);
    deleteProjectData(deletedProject);
    setIsDeleted(!isDeleted);
 
    
    let updateProjectDetails;
    if (status === "Submit Request") {
      updateProjectDetails = submittedProjectDetails.filter(
        (p) => p.wo_id !== deletedProject.wo_id
      );
      setSubmittedProjectDetails(updateProjectDetails);
      setIsDeleted(isDeleted);
    } else if (status === "InProgress") {
      updateProjectDetails = inProgressProjectDetails.filter(
        (p) => p.wo_id !== deletedProject.wo_id
      );
      
      setInProgressProjectDetails(updateProjectDetails);
      setIsDeleted(isDeleted);
    } else if (status === "QA/QC") {
      updateProjectDetails = qaProjectDetails.filter(
        (p) => p.wo_id !== deletedProject.wo_id
      );
      setQAProjectDetails(updateProjectDetails);
      setIsDeleted(isDeleted);
    } else if (status === "Completed") {
      updateProjectDetails = completedProjectDetails.filter(
        (p) => p.wo_id !== deletedProject.wo_id
      );
      setCompletedProjectDetails(updateProjectDetails);
      setIsDeleted(isDeleted);
    }
  
  };

  async function deleteProjectData(deletedProject) {

    console.log('deletedproject',deletedProject);
    try {
      API.post("fieldsurvey", `/deleteProjectData`, {
        headers: {
          Authorization: `${await (await Auth.currentSession())
            .getAccessToken()
            .getJwtToken()}`,
        },
        body: {
          deletedProjects: deletedProject,
        },
      });
      dispatch(removeProject(deletedProject));
    } catch (error) {
      console.log(error);
    }
  }

  async function getData() {
    API.get("fieldsurvey", `/getDashboardData`, {
      headers: {
        Authorization: `${await (await Auth.currentSession())
          .getAccessToken()
          .getJwtToken()}`,
      },
    })
      .then((data) => {
        const projectData = data.result;
        console.log('getdata',projectData);
       // create a new object to update redux state
        const updatedProjectData = projectData.map(project => ({
          ...project,
        }));
        dispatch(setProjects(updatedProjectData));

        setUniqueId(data.unique_id);
        const submittedProjects = projectData.filter(
          (item) => item.status === "Submit Request"
        );
        setSubmittedProjectDetails(submittedProjects);
        const inProgressProjects = projectData.filter(
          (item) => item.status === "InProgress"
        );
        setInProgressProjectDetails(inProgressProjects);
        const qaProjects = projectData.filter(
          (item) => item.status === "QA/QC"
        );
        setQAProjectDetails(qaProjects);
        const completedProjects = projectData.filter(
          (item) => item.status === "Completed"
        );
        setCompletedProjectDetails(completedProjects);
        setIsLoading(false);
        setDismissingAlertShow(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setDismissingAlertShow(true);
        setalertVariant("danger");
        setalertMessage(`Unable to get data.Please try after some time.`);
       
        console.log(
          `Unable to get data. Error: ${error.toString()}, Please try after some time.`,
          "danger"
        );
      });
  }

  async function addData(addedProjects) {
   console.log('addedprojects',addedProjects);
      API.post("fieldsurvey", `/addDashboardData`, {
        headers: {
          Authorization: `${await (await Auth.currentSession())
            .getAccessToken()
            .getJwtToken()}`,
        },
        body: {
          addedProjects: addedProjects,
        },
      })
      .then(() => {
      getData();
      setDismissingAlertShow(false);
      })
      .catch((error) =>{
      console.log("error in adding project", error);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to add project.Please try after some time.`);
      
    });
  }

  async function updateStatus(updateProject) {
    console.log('update',updateProject);
    try {
      API.post("fieldsurvey", `/updateStatusData`, {
        headers: {
          Authorization: `${await (await Auth.currentSession())
            .getAccessToken()
            .getJwtToken()}`,
        },
        body: {
          updateStatus: updateProject,
        },
      });
    
      let statusWoId = updateProject.wo_id ;
      let statusUpdated = updateProject.status ;
      dispatch(updateProjectStatus({statusWoId, status: statusUpdated }));
      setDismissingAlertShow(false);
    } catch (error) {
      console.log("error in updating status", error);
      setDismissingAlertShow(true);
      setalertVariant("danger");
      setalertMessage(`Unable to update status.Please try after some time.`);
  
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTask = () => {
    if (
      !formData.project_name ||
      !formData.desc_of_work ||
      !formData.start_date ||
      !formData.end_date
    ) {
      setAddTaskValidation(true);
      setalertVariant("danger");
      setalertMessage(`All fields are required`);

      // setAddTaskValidation('All fields are required');
      return;
    }
    console.log('formmmm',formData);
    setAddTaskValidation(false);
    setalertVariant("");
    setalertMessage(``);
    if (currentStatus) {
      formData.status = currentStatus;
    
    }

    if (formData.status === "Submit Request") {
      setSubmittedProjectDetails([...submittedProjectDetails, formData]);
    } else if (formData.status === "InProgress") {
      setInProgressProjectDetails([...inProgressProjectDetails, formData]);
    } else if (formData.status === "QA/QC") {
      setQAProjectDetails([...qaProjectDetails, formData]);
    } else if (formData.status === "Completed") {
      setCompletedProjectDetails([...completedProjectDetails, formData]);
    }

    setAddTask(false);
    setAllProjectDetails([...allProjectDetails, formData]);
    let addedProjects = formData;
    console.log('formdattttt',addedProjects);
    addData(addedProjects);
    setFormData({
      project_name: "",
      desc_of_work: "",
      start_date: "",
      status: "",
      end_date: "",
      wo_id : ""
    });
  };

  const handleAddTaskClick = (status) => {
    setCurrentStatus(status);
    setAddTask(true);
  };

  if (!isAuthenticated) {
    checkForValidSession();
  }
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const { source, destination } = result;

    const moveProject = (projectList, setProjectList) => {
      const newProjectList = Array.from(projectList);
      const [movedProject] = newProjectList.splice(source.index, 1);
      newProjectList.splice(destination.index, 0, movedProject);
      setProjectList(newProjectList);
    };

    switch (source.droppableId) {
      case "submittedProjects":
        moveProject(submittedProjectDetails, setSubmittedProjectDetails);
        break;
      case "inProgressProjects":
        moveProject(inProgressProjectDetails, setInProgressProjectDetails);
        break;
      case "qaProjects":
        moveProject(qaProjectDetails, setQAProjectDetails);
        break;
      case "completedProjects":
        moveProject(completedProjectDetails, setCompletedProjectDetails);
        break;
      default:
        break;
    }

    if (source.droppableId !== destination.droppableId) {
      const sourceProjectList = getProjectListById(source.droppableId);
      const destinationProjectList = getProjectListById(
        destination.droppableId
      );

      const [movedProject] = sourceProjectList.splice(source.index, 1);
      destinationProjectList.splice(destination.index, 0, movedProject);

      updateProjectListById(source.droppableId, sourceProjectList);
      updateProjectListById(destination.droppableId, destinationProjectList);

      movedProject.status = getStatusByDroppableId(destination.droppableId);
      let updateProjectStatus = {
        wo_id: movedProject.wo_id,
        status: movedProject.status,
      };
      updateStatus(updateProjectStatus);
    }
  };

  const getProjectListById = (id) => {
    switch (id) {
      case "submittedProjects":
        return submittedProjectDetails;
      case "inProgressProjects":
        return inProgressProjectDetails;
      case "qaProjects":
        return qaProjectDetails;
      case "completedProjects":
        return completedProjectDetails;
      default:
        return [];
    }
  };

  const updateProjectListById = (id, newProjectList) => {
    switch (id) {
      case "submittedProjects":
        setSubmittedProjectDetails(newProjectList);
        break;
      case "inProgressProjects":
        setInProgressProjectDetails(newProjectList);
        break;
      case "qaProjects":
        setQAProjectDetails(newProjectList);
        break;
      case "completedProjects":
        setCompletedProjectDetails(newProjectList);
        break;
      default:
        break;
    }
  };

  const getStatusByDroppableId = (id) => {
    switch (id) {
      case "submittedProjects":
        return "Submit Request";
      case "inProgressProjects":
        return "InProgress";
      case "qaProjects":
        return "QA/QC";
      case "completedProjects":
        return "Completed";
      default:
        return "";
    }
  };
  React.useEffect(() => {
    getData();
  }, [isDeleted]);

  const handleClose = () => {
    setAddTask(false);
    setAddTaskValidation(false);
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const renderModal = () => (
    <Modal
      className="modal-close-out"
      backdrop={false}
      show={addTask}
      onHide={() => setAddTask(false)}
      centered
      animation={false}
    >
      <Modal.Header>
        <Modal.Title>Add Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {addTaskValidation && (
            <Alert
              variant={alertVariant}
              onClose={() => addTaskValidation(false)}
              className="text-center"
            >
              <strong>{alertMessage}</strong>
            </Alert>
          )}
          <Form.Group controlId="taskName" style={{ marginBottom: "15px" }}>
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="taskContent" style={{ marginBottom: "15px" }}>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="desc_of_work"
              value={formData.desc_of_work}
              onChange={handleChange}
              maxLength={200}
              placeholder="Enter project description (max 200 characters)"
              required
            />
          </Form.Group>
          <Row className="g-3">
            <Col md="6">
              <Form.Label className="mb-0">Start Date</Form.Label>
              <Form.Control
                type="date"
                className="form-control"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                style={{ maxWidth: "200px" }}
                required
              />
            </Col>
            <Col md="6">
              <Form.Label className="mb-0">End Date</Form.Label>
              <Form.Control
                type="date"
                className="form-control"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                style={{ maxWidth: "200px" }}
                required
              />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button onClick={handleAddTask}>Save changes</Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div>
      <div className="page-wrapper">
        <section className="scroll-section" id="smallGutters">
          {/* heading starts */}
          <h2 className="small-title">
            <span>Taskboard</span>
            <span style={{ marginLeft: "10px" }}>|</span>
            <span style={{ color: "#000080", marginLeft: "10px" }}>
              Calc/Prep Board
            </span>
          </h2>
          {/* heading ends */}
          {/* main card starts */}
          {!isloading ? (
            <div>
          <Row className="g-2 mb-5">
            {dismissingAlertShow && (
              <Alert
                variant={alertVariant}
                onClose={() => setDismissingAlertShow(false)}
                dismissible
                className="text-center"
              >
                <strong>{alertMessage}</strong>
              </Alert>
            )}


              <DragDropContext onDragEnd={handleDragEnd}>
                {/* main card1  starts  */}
                <Col sm="6" xxl="3">
                  <Card style={{ background: "#dadada", height: "500px" }}>
                    <Card.Body>
                      <div
                        className="d-flex justify-content-between align-items-center mb-1"
                        style={{ fontSize: "20px" }}
                      >
                        <h4 className="heading mb-0" ref={headingRef}>
                          Submit Request
                        </h4>
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="btn-icon btn-icon-only"
                        >
                          <CsLineIcons icon="more-horizontal" />
                        </Button>
                      </div>
                      <Droppable droppableId="submittedProjects">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <DashboardTaskManagement
                              projectDetails={submittedProjectDetails}
                              deleteProject={(project) =>
                                handleDelete(project, "Submit Request")
                              }
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* <div style={{ height: "500px", overflow: "hidden" }}>
                    <DashboardTaskManagement
                      projectDetails={submittedProjectDetails}
                      deleteProject={(project) =>
                        handleDelete(project, "Submit Request")
                      }
                    />
                  </div> */}
                      <Col
                        sm="12"
                        className="mb-3 d-flex justify-content-center align-items-center"
                      >
                        <Button
                          variant="light"
                          className="mb-1"
                          onClick={() => handleAddTaskClick("Submit Request")}
                        >
                          <CsLineIcons icon="plus" /> <span>Add Task</span>
                        </Button>
                      </Col>
                      {renderModal()}
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm="6" xxl="3">
                  <Card style={{ background: "#dadada", height: "500px" }}>
                    <Card.Body>
                      <div
                        className="d-flex justify-content-between align-items-center mb-1"
                        style={{ fontSize: "20px" }}
                      >
                        <h4 className="heading mb-0" ref={headingRef}>
                          InProgress
                        </h4>
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="btn-icon btn-icon-only"
                        >
                          <CsLineIcons icon="more-horizontal" />
                        </Button>
                      </div>
                      <Droppable droppableId="inProgressProjects">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <DashboardTaskManagement
                              projectDetails={inProgressProjectDetails}
                              deleteProject={(project) =>
                                handleDelete(project, "InProgress")
                              }
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      {/* <div style={{ height: "500px", overflow: "hidden" }}>
                    <DashboardTaskManagement
                      projectDetails={inProgressProjectDetails}
                      deleteProject={(project) =>
                        handleDelete(project, "InProgress")
                      }
                    />
                  </div> */}
                      <Col
                        sm="12"
                        className="mb-3 d-flex justify-content-center align-items-center"
                      >
                        <Button
                          variant="light"
                          className="mb-1"
                          onClick={() => handleAddTaskClick("InProgress")}
                        >
                          <CsLineIcons icon="plus" /> <span>Add Task</span>
                        </Button>
                      </Col>
                      {renderModal()}
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm="6" xxl="3">
                  <Card style={{ background: "#dadada", height: "500px" }}>
                    <Card.Body>
                      <div
                        className="d-flex justify-content-between align-items-center mb-1"
                        style={{ fontSize: "20px" }}
                      >
                        <h4 className="heading mb-0" ref={headingRef}>
                          QA/QC
                        </h4>
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="btn-icon btn-icon-only"
                        >
                          <CsLineIcons icon="more-horizontal" />
                        </Button>
                      </div>
                      <Droppable droppableId="qaProjects">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <DashboardTaskManagement
                              projectDetails={qaProjectDetails}
                              deleteProject={(project) =>
                                handleDelete(project, "QA/QC")
                              }
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      {/* <div style={{ height: "500px", overflow: "hidden" }}>
                    <DashboardTaskManagement
                      projectDetails={qaProjectDetails}
                      deleteProject={(project) =>
                        handleDelete(project, " QA/QC")
                      }
                    />
                  </div> */}
                      <Col
                        sm="12"
                        className="mb-3 d-flex justify-content-center align-items-center"
                      >
                        <Button
                          variant="light"
                          className="mb-1"
                          onClick={() => handleAddTaskClick("QA/QC")}
                        >
                          <CsLineIcons icon="plus" /> <span>Add Task</span>
                        </Button>
                      </Col>
                      {renderModal()}
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm="6" xxl="3">
                  <Card style={{ background: "#dadada", height: "500px" }}>
                    <Card.Body>
                      <div
                        className="d-flex justify-content-between align-items-center mb-1"
                        style={{ fontSize: "20px" }}
                      >
                        <h4 className="heading mb-0" ref={headingRef}>
                          Completed
                        </h4>
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="btn-icon btn-icon-only"
                        >
                          <CsLineIcons icon="more-horizontal" />
                        </Button>
                      </div>
                      <Droppable droppableId="completedProjects">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <DashboardTaskManagement
                              projectDetails={completedProjectDetails}
                              deleteProject={(project) =>
                                handleDelete(project, "Completed")
                              }
                            />
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      {/* <div style={{ height: "500px", overflow: "hidden" }}>
                    <DashboardTaskManagement
                      projectDetails={completedProjectDetails}
                      deleteProject={(project) =>
                        handleDelete(project, "Completed")
                      }
                    />
                  </div> */}
                    </Card.Body>
                  </Card>
                </Col>
              </DragDropContext>
            
          </Row>

          <Col xs="12" xl="6">
            <section className="scroll-section" id="horizontalBarChart">
              <h1> Overview</h1>
              <Card body className="mb-5">
                <div className="sh-35">
                  <DashboardAnalysis
                    submittedRequests={submittedProjectDetails}
                    qaRequests={qaProjectDetails}
                    completedRequests={completedProjectDetails}
                    inProgressRequests={inProgressProjectDetails}
                  />
                </div>
              </Card>
            </section>
          </Col>
          </div>
          ) : (
            <div>
              <div className="text-center" style={{ marginTop: `250px` }}>
                <Spinner animation="border" variant="primary" />
                <p> Loading...</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardsPage;
