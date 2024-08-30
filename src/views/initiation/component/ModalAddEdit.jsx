import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { API, Auth } from "aws-amplify";

const ModalAddEdit = ({ tableInstance }) => {
  const {
    selectedFlatRows,
    data,
    setData,
    setIsOpenAddEditModal,
    isOpenAddEditModal,
  } = tableInstance;

  const emptyItem = {
    id: data.length + 1,
    project_name: "",
    type_of_work: "",
    start_date: "",
    status: "",
  };

  const [selectedItem, setSelectedItem] = useState(emptyItem);

  useEffect(() => {
    if (isOpenAddEditModal && selectedFlatRows.length === 1) {
      setSelectedItem(selectedFlatRows[0].original);
    } else {
      //setSelectedItem(emptyItem);
    }
  }, [isOpenAddEditModal, selectedFlatRows, emptyItem]);

  const changeName = (event) => {
    setSelectedItem({ ...selectedItem, project_name: event.target.value });
  };
  const changeWorkType = (event) => {
    setSelectedItem({ ...selectedItem, type_of_work: event.target.value });
  };
  const changeStartDate = (event) => {
    setSelectedItem({ ...selectedItem, start_date: event.target.value });
  };
  const changeStatus = (event) => {
    if (event.target.checked) {
      setSelectedItem({ ...selectedItem, status: event.target.value });
    }
  };

  async function addData(addedProjects) {
    console.log('addedprojects', addedProjects);
    try {
      const token = await (await Auth.currentSession())
        .getAccessToken()
        .getJwtToken();
      await API.post("fieldsurvey", "/saveGridRequest", {
        headers: {
          Authorization: `${token}`,
        },
        body: addedProjects,
      });


      const response = await API.get(
        "fieldsurvey",
        `/getWorkList`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      console.log('response', response);
      response?.forEach(item => {
        if (item.start_date) {
          item.start_date = formatDate(item.start_date);
        }
      });

      setData(response);


    } catch (error) {
      console.log("error in adding project", error);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
  }

  const saveItem = () => {
    console.log("ghhh", selectedItem);
    if (selectedFlatRows.length === 1) {
      const { index } = selectedFlatRows[0];
      const newData = data.map((row, rowIndex) =>
        rowIndex === index ? selectedItem : row
      );
      setData(newData);
    } else {
      if (selectedItem.start_date) {
        selectedItem.start_date = formatDate(selectedItem.start_date);
      }
      const newData = [selectedItem, ...data];
      setData(newData);
      addData(selectedItem);
    }
    setIsOpenAddEditModal(false);
  };

  return (
    <Modal
      className=" modal-right fade"
      show={isOpenAddEditModal}
      onHide={() => setIsOpenAddEditModal(false)}
    >
      <Modal.Header>
        <Modal.Title>
          {selectedFlatRows.length === 1 ? "Edit" : "Add"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div className="mb-3">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              defaultValue={selectedItem ? selectedItem.project_name : ""}
              onChange={changeName}
            />
          </div>
          <div className="mb-3">
            <Form.Label>Work Type</Form.Label>
            <Form.Check
              type="radio"
              label="Mapping"
              value="Mapping"
              id="categoryRadio1"
              name="categoryRadio"
              checked={selectedItem && selectedItem.type_of_work === "Mapping"}
              onChange={changeWorkType}
            />
            <Form.Check
              type="radio"
              label="Analysis"
              value="Analysis"
              id="categoryRadio2"
              name="categoryRadio"
              checked={selectedItem && selectedItem.type_of_work === "Analysis"}
              onChange={changeWorkType}
            />
            <Form.Check
              type="radio"
              label="Surveying"
              value="Surveying"
              id="categoryRadio3"
              name="categoryRadio"
              checked={
                selectedItem && selectedItem.type_of_work === "Surveying"
              }
              onChange={changeWorkType}
            />
            <Form.Check
              type="radio"
              label="Processing"
              value="Processing"
              id="categoryRadio4"
              name="categoryRadio"
              checked={
                selectedItem && selectedItem.type_of_work === "Processing"
              }
              onChange={changeWorkType}
            />
          </div>
          <div className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              defaultValue={selectedItem ? selectedItem.start_date : ""}
              onChange={changeStartDate}
            />
          </div>
          <div className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Check
              type="radio"
              label="Submitted Request"
              value="Submitted Request"
              id="tagRadio1"
              name="tagRadio"
              checked={
                selectedItem && selectedItem.status === "Submitted Request"
              }
              onChange={changeStatus}
            />
            <Form.Check
              type="radio"
              label="InProgress"
              value="InProgress"
              id="tagRadio2"
              name="tagRadio"
              checked={selectedItem && selectedItem.status === "InProgress"}
              onChange={changeStatus}
            />
            <Form.Check
              type="radio"
              label="QA/QC"
              value="QA/QC"
              id="tagRadio3"
              name="tagRadio"
              checked={selectedItem && selectedItem.status === "QA/QC"}
              onChange={changeStatus}
            />
            <Form.Check
              type="radio"
              label="Completed"
              value="Completed"
              id="tagRadio4"
              name="tagRadio"
              checked={selectedItem && selectedItem.status === "Completed"}
              onChange={changeStatus}
            />
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-primary"
          onClick={() => setIsOpenAddEditModal(false)}
        >
          Cancel
        </Button>
        <Button variant="primary" onClick={saveItem}>
          {selectedFlatRows.length === 1 ? "Done" : "Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAddEdit;
