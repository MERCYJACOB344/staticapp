import React from 'react';
import CsLineIcons from '../../../cs-line-icons/CsLineIcons';

const ControlsSearch = ({ tableInstance }) => {
  const {
    setGlobalFilter,
    state: { globalFilter },
  } = tableInstance;

  const [value, setValue] = React.useState(globalFilter);

  const onChange = (val) => {
    setGlobalFilter(val || undefined);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setValue('');
    onChange('');
  };

  return (
    <>
      <input
        className="form-control datatable-search"
        value={value || ''}
        onChange={handleInputChange}
        placeholder="Search"
        style={{ width: '300px' }} // Adjust the width as needed
      />
      {value && value.length > 0 ? (
        <span className="search-delete-icon" onClick={handleClear}>
          <CsLineIcons icon="close" />
        </span>
      ) : (
        <span className="search-magnifier-icon pe-none">
          <CsLineIcons icon="search" />
        </span>
      )}
    </>
  );
};

export default ControlsSearch;
