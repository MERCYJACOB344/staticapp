import React, { useState, useEffect } from "react";
import { Badge, Col, Form, Row, Spinner } from "react-bootstrap";
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
  useRowSelect,
  useRowState,
} from "react-table";
import { useAppContext } from "../../lib/contextLib";
import ButtonsCheckAll from "./component/ButtonsCheckAll";
import ButtonsAddNew from "./component/ButtonsAddNew";
import ControlsPageSize from "./component/ControlsPageSize";
import ControlsAdd from "./component/ControlsAdd";
import ControlsEdit from "./component/ControlsEdit";
import ControlsDelete from "./component/ControlsDelete";
import ControlsSearch from "./component/ControlsSearch";
import ModalAddEdit from "./component/ModalAddEdit";
import Table from "./component/Table";
import TablePagination from "./component/TablePagination";
import { checkForValidSession, getParameterByName } from "../../lib/commonLib";
import { API, Auth } from "aws-amplify";

const GridList = () => {
  const title = "Taskboard";
  const { isAuthenticated } = useAppContext();
  const [projectData, setProjectData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!isAuthenticated) {
    checkForValidSession();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
  }

  const getData = async (editData) => {
    setIsLoading(true);
    try {
  
     
  
      const response = await fetch(`/api/getAllWorkOrders`);
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      console.log('response', data);
      data.forEach(item => {
        if (item.start_date) {
          item.start_date = formatDate(item.start_date);
        }
      });
  
      setData(data);
    } catch (error) {
      console.error("Error fetching work list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const columns = React.useMemo(() => {
    return [
      {
        Header: "Project Name",
        accessor: "project_name",
        sortable: true,
        headerClassName: "text-muted text-small text-uppercase w-30",
        Cell: ({ cell }) => {
          return (
            <a
              className="list-item-heading body"
              href="#!"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              {cell.value}
            </a>
          );
        },
      },
      {
        Header: "Work Type",
        accessor: "type_of_work",
        sortable: true,
        headerClassName: "text-muted text-small text-uppercase w-10",
      },
      {
        Header: "Start Date",
        accessor: "start_date",
        sortable: true,
        headerClassName: "text-muted text-small text-uppercase w-10",
      },
      {
        Header: "Status",
        accessor: "status",
        sortable: true,
        headerClassName: "text-muted text-small text-uppercase w-10",
        Cell: ({ cell }) => {
          return <Badge bg="outline-primary">{cell.value}</Badge>;
        },
      },
      {
        Header: "",
        id: "action",
        headerClassName: "empty w-10",
        Cell: ({ row }) => {
          const { checked, onChange } = row.getToggleRowSelectedProps();
          return (
            <Form.Check
              className="form-check float-end mt-1"
              type="checkbox"
              checked={checked}
              onChange={onChange}
            />
          );
        },
      },
    ];
  }, []);

  const [data, setData] = React.useState([]);

  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);

  const tableInstance = useTable(
    {
      columns,
      data,
      setData,
      isOpenAddEditModal,
      setIsOpenAddEditModal,
      initialState: { pageIndex: 0 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  return (
    <>
      <Row>
        <Col>
          <div className="page-title-container">
            <Row>
              <Col xs="12" md="7">
                <h1 className="mb-0 pb-0 display-4">{title}</h1>
              </Col>
              <Col
                xs="12"
                md="5"
                className="d-flex align-items-start justify-content-end"
              >
                <ButtonsAddNew tableInstance={tableInstance} />{" "}
                <ButtonsCheckAll tableInstance={tableInstance} />
              </Col>
            </Row>
          </div>

          <div>
            <Row className="mb-3">
              <Col sm="12" md="7" lg="4" xxl="3">
                <div className="d-inline-block float-md-start me-1 mb-1 mb-md-0 search-input-container w-100 shadow bg-foreground">
                  <ControlsSearch tableInstance={tableInstance} />
                </div>
              </Col>
              <Col sm="12" md="5" lg="8" xxl="9" className="text-end">
                <div className="d-inline-block me-0 me-sm-3 float-start float-md-none">
                  <ControlsEdit tableInstance={tableInstance} />{" "}
                  <ControlsDelete tableInstance={tableInstance} />
                </div>
                <div className="d-inline-block">
                  <ControlsPageSize tableInstance={tableInstance} />
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs="12">
                {isLoading ? (
                  <div className="text-center" style={{ marginTop: `150px` }}>
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : (
                  <>
                    <Table
                      className="react-table rows"
                      tableInstance={tableInstance}
                    />
                    <TablePagination tableInstance={tableInstance} />
                  </>
                )}
              </Col>
            </Row>
          </div>
          <ModalAddEdit tableInstance={tableInstance} />
        </Col>
      </Row>
    </>
  );
};

export default GridList;
