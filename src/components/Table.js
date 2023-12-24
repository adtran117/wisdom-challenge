import { useState, useEffect, useRef, forwardRef } from 'react';
import _ from 'lodash';
import './Table.css';

import {
  Switch,
  FormControlLabel,
  FormGroup,
  InputBase,
  IconButton,
  Divider,
  Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';


const Table = ({data=[]}) => {
  // Material UI Alert
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleCloseError = () => {
    setSearchError('');
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toggleOptions, setToggleOptions] = useState({});
  const [displayedHeaders, setDisplayedHeaders] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const dropdownRef = useRef(null);
  const colIconRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        colIconRef.current && !colIconRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionKey) => {
    setToggleOptions(prev => ({
      ...prev,
      [optionKey]: {
        show: !prev[optionKey].show,
        label: prev[optionKey].label,
      }
    }));
  };

  const hideAllColumns = () => {
    setToggleOptions(prev => {
      const newOptions = Object.assign({}, prev);

      _.each(prev, (val, key) => {
        newOptions[key].show = false;
      });
      return newOptions;
    });
  };

  const showAllColumns = () => {
    setToggleOptions(prev => {
      const newOptions = Object.assign({}, prev);

      _.each(prev, (val, key) => {
        newOptions[key].show = true;
      });
      return newOptions;
    }); 
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    setSearchError('');

    if (!term) {
      setDisplayedRows(data);
      return;
    }

    try {
      const filters = term.split('and').map(filter => {
        let [column, operator, value] = filter.split(/(=~|=)/).map(t => t.trim());
        if (!column || !operator || !value) {
          throw new Error('Invalid format');
        }

        column = column.replace(' ', '_');
        return { column, operator, value };
      });

      const filtered = data.filter(row =>{
        return filters.every(({ column, operator, value }) => {
          const cellValue = String(row[column]).toLowerCase();
          return operator === '=' ? cellValue === value : cellValue.includes(value);
        })
      });

      setDisplayedRows(filtered);
    } catch (error) {
      setSearchError('Invalid search format. Use "Column = Value" or "Column =~ Value" and combine filters with AND');
    }
  };


  useEffect(() => {
    const
      headerData = [],
      toggleData = {}
    ;
    _.each(data[0], (val, key) => {
      if (!key.includes(':@')) {
        headerData.push({
          key,
          label: _.startCase(key),
        });

        toggleData[key] = {show: true, label: _.startCase(key)};
      }
    });
    setDisplayedHeaders(headerData);
    setToggleOptions(toggleData);
    setDisplayedRows(data)
  }, [data]);

  const allColumnsVisible = Object.values(toggleOptions).every(v => v.show);
  const allColumnsHidden = Object.values(toggleOptions).every(v => !v.show);
  
  return (
    <>
      <Snackbar open={!!searchError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {searchError}
        </Alert>
      </Snackbar>

      <div className="topbar">
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder='Column Name - Condition - Value'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleEnter}
        />
        <IconButton className="searchButton" onClick={() => handleSearch() } type="button" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon className="search" />
        </IconButton>
        <Divider sx={{height: 28}} orientation="vertical" />

        <IconButton className="colButton" type="button" sx={{ p: '10px' }}>
          <ViewColumnIcon className="columnIcon" ref={colIconRef} onClick={() => setDropdownOpen(!dropdownOpen)}/>
        </IconButton>
        {dropdownOpen && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <div className="dropdown-actions">
            <span 
                onClick={!allColumnsHidden ? hideAllColumns : undefined}
                className={allColumnsHidden ? 'disabled' : ''}>
                Hide All
              </span>
              <span 
                onClick={!allColumnsVisible ? showAllColumns : undefined}
                className={allColumnsVisible ? 'disabled' : ''}>
                Show All
              </span>
            </div>
            <FormGroup>
              {
                _.map(toggleOptions, (val, key) => (
                  <FormControlLabel key={key} control={<Switch color="success" checked={val.show} onClick={() => handleToggleOption(key)}/>} label={val.label} />
                ))
              }
            </FormGroup>
          </div>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            {displayedHeaders.map((data, index) => (
              toggleOptions[data.key].show ?
                <th key={index}>
                  {data.label}
                </th>
                :
                <></>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((item, index) => (
            <tr key={index}>
              {
                displayedHeaders.map(val => (
                  toggleOptions[val.key].show ?
                    <td key={val.key}>
                      {item[val.key]}
                    </td>
                    :
                    <></>
                ))
              } 
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Table;