import React, { useState, useEffect, useRef } from "react";
import CsLineIcons from "../../../cs-line-icons/CsLineIcons";
import { Button, Form, Row, Col } from "react-bootstrap";
import { API, Auth } from "aws-amplify";
import { v4 as uuidv4 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";

const InitiationFileUpload = ({
  documentDeleteHandler = () => {},
  uploadAttachment,
  editDocumentList,
  clearFileName,
}) => {
  const [addDocumentCount, setAddDocumentCount] = useState([
    { id: uuidv4(), adddocument: null },
  ]);
  const [editDocuments, seteditDocuments] = useState([]);
  const [deleteFlag, setdeleteFlag] = useState(false);
  const fileInputRefs = useRef({});
  const sasToken = process.env.REACT_APP_SAS_TOKEN;
  const storageAccountName = process.env.REACT_APP_STORAGE_ACCOUNT_NAME;
  const containerName = process.env.REACT_APP_CONTAINER_NAME;
  const handleDownload = async (item) => {
    const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${item.fileKey}?${sasToken}`;
    try {
      const response = await fetch(blobUrl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optionally, revoke the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const handleProjectDocumentChange = (e, id) => {
    const file = e.target.files[0];
    setAddDocumentCount((prevState) =>
      prevState.map((doc) =>
        doc.id === id ? { ...doc, adddocument: file } : doc
      )
    );
  };
  uploadAttachment(addDocumentCount);
  const documentRemove = (id) => {
    setAddDocumentCount((prevState) => {
      const updatedList = prevState.filter((doc) => doc.id !== id);
      if (updatedList.length === 0) {
        const newId = uuidv4();
        updatedList.push({ id: newId, adddocument: null });
      }
      return updatedList;
    });

    delete fileInputRefs.current[id];
  };

  const handleDelete = async (item) => {
    setdeleteFlag(true);
    const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${item.fileKey}?${sasToken}`;
    const blobServiceClient = new BlobServiceClient(blobUrl);

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(item.fileKey);

    try {
      await blockBlobClient.delete();
      console.log(`Blob ${blobName} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting blob:", error);
    }
    const indexvalue = editDocumentList.findIndex((element, index) => {
      if (element.fileKey.includes(item.fileKey)) {
        return true;
      }
      return false;
    });

    let tmpProjectDocs = null;
    editDocumentList.splice(indexvalue, 1);
    let editdoc = editDocumentList.filter(
      (items) => items.fileName !== item.fileName
    );

    if (editDocumentList == null) {
      tmpProjectDocs = [];
    } else {
      tmpProjectDocs = editDocumentList;
    }
    documentDeleteHandler(tmpProjectDocs);
    seteditDocuments(editdoc);
  };

  useEffect(() => {
    if (clearFileName) {
      Object.keys(fileInputRefs.current).forEach((id) => {
        if (fileInputRefs.current[id]) {
          fileInputRefs.current[id].value = "";
        }
      });
    }
  }, [clearFileName]);

  return (
    <>
      <div className="row">
        <div className="col-md-4">
          <div className="card-body">
            <Form>
              <h5 className="label">UPLOAD ATTACHMENTS</h5>
              {addDocumentCount.map((singleDocument, index) => (
                <div key={singleDocument.id} className="documentupload">
                  <Row>
                    <Col>
                      <Form.Group
                        controlId={`formFile_${singleDocument.id}`}
                        className="mb-3"
                      >
                        <Form.Control
                          type="file"
                          accept=".pdf,.docx,.jpg,.jpeg,.png,.msg,.xlsx"
                          onChange={(e) =>
                            handleProjectDocumentChange(e, singleDocument.id)
                          }
                          ref={(el) =>
                            (fileInputRefs.current[singleDocument.id] = el)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Button
                        onClick={() => documentRemove(singleDocument.id)}
                        variant="secondary"
                      >
                        Remove
                      </Button>
                    </Col>

                    <Col>
                      {addDocumentCount.length - 1 === index &&
                        addDocumentCount.length < 5 && (
                          <Button
                            onClick={() =>
                              setAddDocumentCount([
                                ...addDocumentCount,
                                { id: uuidv4(), adddocument: null },
                              ])
                            }
                            variant="foreground-alternate"
                          >
                            <CsLineIcons icon="plus" />{" "}
                            <span>ADD NEW DOCUMENT</span>
                          </Button>
                        )}
                    </Col>
                  </Row>
                </div>
              ))}
            </Form>
          </div>
        </div>
      </div>

      <div className="col-md-8">
        <div className="card-body">
          <h5 className="label">DOCUMENTS UPLOADED</h5>
          <br />
          {editDocumentList === null ? (
            <div>
              <p>No files uploaded </p>
            </div>
          ) : (
            <div>
              <div className="row g-0 h-100 align-content-center mb-2 custom-sort d-none d-sm-flex">
                <div className="col-sm-2 d-flex align-items-center">
                  File Name
                </div>
              </div>
              {deleteFlag ? (
                <div>
                  {editDocuments?.map((item, index) => (
                    <div id="href-link" className="list scroll-out" key={index}>
                      <div
                        className="scroll-by-count"
                        data-count="5"
                        data-childselector=".scroll-child"
                      >
                        <div className="h-auto sh-sm-5 mb-3 mb-sm-0 scroll-child">
                          <div className="row g-0 h-100 align-content-center">
                            <div className="col-sm-4 d-flex align-items-center">
                              <a
                                href="#href-link"
                                className="body-link"
                                onClick={(e) => handleDownload(item)}
                              >
                                {item.fileName}
                              </a>
                            </div>

                            <div className="col-sm-2  d-flex">
                              <Button
                                variant="outline-primary"
                                onClick={(e) => handleDelete(item)}
                              >
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
                  {editDocumentList?.map((item, index) => (
                    <div id="href-link" className="list scroll-out" key={index}>
                      <div
                        className="scroll-by-count"
                        data-count="5"
                        data-childselector=".scroll-child"
                      >
                        <div className="h-auto sh-sm-6 mb-3 mb-sm-0 scroll-child">
                          <div className="row g-0 h-100 align-content-center">
                            <div className="col-sm-4 d-flex align-items-center">
                              <a
                                href="#href-link"
                                className="body-link"
                                onClick={(e) => handleDownload(item)}
                              >
                                {item.fileName}
                              </a>
                            </div>
                            <div className="col-sm-2 d-grid gap-2 d-flex align-items-center ">
                              <div className="col-sm-2  d-flex">
                                <Button
                                  variant="outline-primary"
                                  onClick={(e) => handleDelete(item)}
                                >
                                  Delete
                                </Button>
                              </div>
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
      </div>
    </>
  );
};

export default InitiationFileUpload;
