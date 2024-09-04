import React from 'react';

const Legend = () => {
  const legendItems = [
    { color: 'blue', label: 'InProgress' },
    { color: 'orange', label: 'Submit Request' },
    { color: 'green', label: 'QA/QC' },
    { color: 'red', label: 'Completed' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
    }}>
      <h4>Project Status</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {legendItems.map((item, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '15px',
                height: '15px',
                backgroundColor: item.color,
                marginRight: '10px',
                borderRadius: '50%',
              }}
            ></span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;
