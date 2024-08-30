import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from '../../../cs-line-icons/CsLineIcons';
import { API, Auth } from 'aws-amplify';

const ControlsDelete = ({ tableInstance }) => {
  const {
    selectedFlatRows,
    data,
    setData,
    state: { selectedRowIds },
  } = tableInstance;

  const deleteProjectData = async (deletedProjects) => {
    try {
      console.log("Deleted Projects :", deletedProjects);
      await API.post('fieldsurvey', '/deleteWorkOrder', {
        headers: {
          Authorization: `${await (await Auth.currentSession())
            .getAccessToken()
            .getJwtToken()}`,
        },
        body: {
          deletedProjects: deletedProjects,
        },
      });
    } catch (error) {
      console.log('Error deleting project:', error);
    }
  };

  const onClick = async () => {
    const selectedData = selectedFlatRows.map((row) => row.original);
    await deleteProjectData(selectedData);
    setData(data.filter((x, index) => selectedRowIds[index] !== true));
  };

  if (selectedFlatRows.length === 0) {
    return (
      <Button
        variant="foreground-alternate"
        className="btn-icon btn-icon-only shadow delete-datatable"
        disabled
      >
        <CsLineIcons icon="bin" />
      </Button>
    );
  }
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="tooltip-top-delete">Delete</Tooltip>}
    >
      <Button
        onClick={onClick}
        variant="foreground-alternate"
        className="btn-icon btn-icon-only shadow delete-datatable"
      >
        <CsLineIcons icon="bin" />
      </Button>
    </OverlayTrigger>
  );
};

export default ControlsDelete;
