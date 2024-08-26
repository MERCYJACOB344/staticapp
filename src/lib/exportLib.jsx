import xlsx from 'json-as-xlsx';

/*

Usage: 
import { exportToXLSX } from "lib/exportLib"
import { Button } from 'react-bootstrap';

const downloadXls = () => {

    const headers = [
      { label: "Project ID", value: "projectId" }, 
      { label: "Project Name", value: "projectname" }, 
      { label: "Broadband Type", value: "broadbandtype" }, 
      { label: "Transmission Type", value: "transmissiontype" }, 
      { label: "Last Update Dt", value: "lastUpdateDt" }
    ];  
    exportToXLSX(orderedProjectList, headers);
  };

<div >
    <Button onClick={() => downloadXls()} variant="secondary">Download</Button>
</div>

*/

export function exportToXLSX(data, headers, downloadFileName = 'MySpreadsheet', sheetName = 'Sheet') {
  const tmpData = [
    {
      sheet: sheetName,
      columns: headers,
      content: data,
    },
  ];

  const settings = {
    fileName: downloadFileName, // Name of the resulting spreadsheet
    extraLength: 3, // A bigger number means that columns will be wider
    writeMode: 'writeFile',
    writeOptions: {},
  };

  xlsx(tmpData, settings); // Will download the excel file
}
