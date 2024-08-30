import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from '../../../cs-line-icons/CsLineIcons';
import { useHistory } from "react-router-dom";

const ControlsEdit = ({ tableInstance }) => {
  const { selectedFlatRows, setIsOpenAddEditModal } = tableInstance;
  const history = useHistory();

  const onClick = async () => {
    const selectedData = selectedFlatRows.map((row) => row.original);
    console.log('Selected Data',selectedData[0]);

    history.push({
      pathname: "/initiation",
      state: { editData: selectedData[0] },
    });

  };
  

  if (selectedFlatRows.length !== 1) {
    return (
      <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow edit-datatable" disabled>
        <CsLineIcons icon="edit" />
      </Button>
    );
  }
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top-edit">Edit</Tooltip>}>
      <Button onClick={onClick} variant="foreground-alternate" className="btn-icon btn-icon-only shadow edit-datatable">
        <CsLineIcons icon="edit" />
      </Button>
    </OverlayTrigger>
  );
};
export default ControlsEdit;
