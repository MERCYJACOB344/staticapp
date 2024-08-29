import { Card, Col, Row, Button, Modal, Form } from "react-bootstrap";
import React, { useEffect } from "react";
import CsLineIcons from "../../../cs-line-icons/CsLineIcons";
import { Draggable } from "react-beautiful-dnd";
import ScrollByCount from "../../../components/scroll-by-count/ScrollByCount";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useHistory } from "react-router-dom";

const DashboardTaskManagement = ({ projectDetails, deleteProject }) => {
 
  const history = useHistory();
 console.log('inside');
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleEditClick = (project) => {
    console.log('proj',project);
    history.push({
      pathname: "/initiation",
      state: { editData: project },
    });
  };

  return (
    <OverlayScrollbarsComponent
      options={{ overflowBehavior: { x: "hidden", y: "scroll" } }}
      className="scroll-track-visible"
      style={{ maxHeight: "360px" }}
    >
      <Row>
        {projectDetails.length === 0 ? (
          <Col
            sm="12"
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100%", fontSize: "15px" }}
          >
            <div className="text-center mt-7">
              <p>No Requests</p>
            </div>
          </Col>
        ) : (
          projectDetails.map((project, index) => (
            <Draggable
              key={project.wo_id}
              draggableId={project.wo_id.toString()}
              index={index}
            >
              {(provided) => (
                <Col sm="12" className="mb-3">
                  <Card
                    className="inner-card"
                    style={{ background: "#ffffff" }}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Control
                          type="text"
                          name="project_name"
                          className="heading mb-0"
                          value={project.project_name}
                          //   onChange={(e) => onChange(e, index)}
                          style={{
                            border: "none",
                            boxShadow: "none",
                            fontSize: "20px",
                          }} // Remove outline
                        />
                        <Button
                          onClick={() => handleEditClick(project)}
                          variant="foreground-alternate"
                        >
                          <CsLineIcons
                            icon="edit"
                            style={{ fontSize: "16px" }}
                            cursor="pointer"
                          />
                        </Button>
                      </div>
                      <Form.Control
                        as="textarea"
                        name="desc_of_work"
                        className="text-muted mb-0 mt-3"
                        rows={2}
                        maxLength={200}
                        value={project.desc_of_work}
                        // placeholder="Enter project description (max 200 characters)"
                        // onChange={(e) => onChange(e, index)}
                        style={{
                          border: "none",
                          boxShadow: "none",
                          fontSize: "18px",
                        }} // Remove outline
                      />
                      <div className="d-flex align-items-center justify-content-between mt-3">
                        <Form.Control
                          type="date"
                          name="start_date"
                          className="form-control"
                          value={formatDate(project.start_date)}
                          // onChange={(e) => onChange(e, index)}
                          style={{
                            maxWidth: "300px",
                            border: "none",
                            boxShadow: "none",
                          }} // Remove outline
                        />
                        <Button
                          variant="foreground-alternate"
                          onClick={(e) => deleteProject(project)}
                        >
                          <div className="d-flex align-items-center">
                            <CsLineIcons
                              icon="bin"
                              style={{ fontSize: "16px", marginLeft: "10px" }}
                            />
                          </div>
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Draggable>
          ))
        )}
      </Row>
    </OverlayScrollbarsComponent>
  );
};

export default DashboardTaskManagement;
