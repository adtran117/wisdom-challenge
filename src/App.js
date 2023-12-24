import './App.css';
import { useState, useEffect } from 'react';
import Table from './components/Table';

function App() {
  const [tableData , setTableData] = useState([]);
  const fetchData = async () => {
    try {
      const url = 'https://data.sfgov.org/resource/yitu-d5am.json';
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error('Bad Response');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchData().then(data => {
      setTableData(data);
    }); 
  }, []);



  return (
    <Table data={tableData}/>
  );
}

export default App;
