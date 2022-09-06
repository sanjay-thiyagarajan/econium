import './App.css';
import React, { useRef } from 'react';
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
import { Button, TextField, Dropdown, Divider, Checkbox } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import DataTable from 'react-data-table-component';
import { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {firestore} from "./firebase";
import {addDoc, collection, getDocs} from "@firebase/firestore";

function App() {
  var ref = null;
  const monday = mondaySdk();
  monday.setToken(process.env.REACT_APP_MONDAY_TOKEN);
  monday.api(`query { users { id, name } }`).then(res => {
    ref = collection(firestore,"companies/" + res.account_id + "/employees");
  });
  const [openEmp, setOpenEmp] = React.useState(false);
  const [openVeh, setOpenVeh] = React.useState(false);
  const [openAllow, setOpenAllow] = React.useState(false);
  const [isPublic, setPublic] = React.useState(false);
  const [eData, setEData] = React.useState([]);
  const handleOpenEmp = () => setOpenEmp(true);
  const handleOpenVeh = () => setOpenVeh(true);
  const handleOpenAllow = () => setOpenAllow(true);
  const handleCloseEmp = () => setOpenEmp(false);
  const handleCloseVeh = () => setOpenVeh(false);
  const handleCloseAllow = () => setOpenAllow(false);
  
  const empIdRef = useRef();
  const empNameRef = useRef();
  const empDistRef = useRef();
  
  var carType, fuelType;
  
  const changePublic = () => {
    setPublic(!isPublic);
  }
  
  const fetchEmployees = async() => {
    var result = [];
    monday.api(`query { users { id, name } }`).then(async(res) => {
      ref = collection(firestore,"companies/" + res.account_id + "/employees");
      const querySnapshot = await getDocs(ref);
      querySnapshot.docs.forEach((doc)=>{
        result.push(doc.data());
      });
      setEData(result);
    });
  }
  
  useEffect(()=>{
    fetchEmployees();
  }, []);

  const handleEmpSave = async(e)=>{
      e.preventDefault();
      try {
        let data = {
          id: empIdRef.current.value,
          name: empNameRef.current.value,
          car_type: carType,
          fuel_type: fuelType,
          distance: empDistRef.current.value
        };
        const fuel_cost = {
          'petrol': 120,
          'diesel': 132,
          'lpg': 83,
          'hybrid': 122.1,
          'cng': 112,
          'electric': 60
        }
        const car_type_cost = {
          'small': 1,
          'midsize': 2,
          'luxury_suv_van': 3
        }
        const cost = fuel_cost[data.fuel_type] * data.distance * car_type_cost[data.car_type];
        data['emission'] = cost;
        addDoc(ref, data);
        handleCloseEmp();
      }
      catch(e){
          console.log(e);
      }
  };
  
  const employeeNames = eData.map(({ name }) => name);
  const employeeEmissions = eData.map(({ emission }) => emission);
  const data = {
    labels: employeeNames,
    datasets: [{
      label: 'Emission Level',
      data: employeeEmissions,
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgb(75, 192, 192)',
      tension: 0.3,
      lineTension: 0.5
    }]
  };
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  const tData = {
    data: eData,
    columns : [
      {name:'Employee ID', selector: 'id', sortable: true},
      {name:'Employee Name', selector: 'name', sortable: true},
      {name:'Emission', selector: 'emission', sortable: true}
    ]
  }
  
  const fuelPlotData = {
    data: {
      'petrol': 0,
      'diesel': 0,
      'lpg': 0,
      'hybrid': 0,
      'cng': 0,
      'electric': 0
    }
  }
  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };
  
  return (
    <div className="App">
      <div className='panel-2'>
        <Box className='card'>
          <header title='Manage' className="cardTitle">Leaderboard</header>
          <Divider />
          <DataTable
            columns={tData.columns}
            data={tData.data}
            defaultSortField={tData.emission}
            striped
            pagination
            className='leaderboard'
          />
        </Box>
        <Box className='card'>
          <header title='Manage' className="cardTitle">Manage</header>
          <Divider />
          <Button className='mgmtButtons' onClick = {handleOpenEmp} color = {Button.colors.PRIMARY}>Add Employee</Button>
          {/* <Button className='mgmtButtons' onClick = {handleOpenVeh} style={{backgroundColor: 'green'}}>Add Vehicle</Button> */}
          <Button className='mgmtButtons' onClick = {handleOpenAllow} color = {Button.colors.POSITIVE}>Add Allowance</Button>
        </Box>
      </div>
      <div className='panel-2'>
        <Box className='card'>
          <Bar data={data}/>
        </Box>
        <Box className='card'>
          <Bar data={data}/>
        </Box>
      </div>
      <Modal
        open={openEmp}
        onClose={handleCloseEmp}
      >
        <Box sx={style}>
          <header title='Manage' className="cardTitle">Add Employee</header>
          <br/>
          <form onSubmit={handleEmpSave}>
          <TextField
            name = "empIdField"
            placeholder="Employee ID"
            ref={empIdRef}
          /><br/>
          <TextField
            name = "empNameField"
            placeholder="Employee Name"
            ref={empNameRef}
          /><br/>
          <Checkbox
            isPublic
            label="Public Transport"
            onChange={changePublic}
          /><br/>
          <div className='personalTransportFields' style={!isPublic ? {} : { display: 'none' }}>
            <Dropdown
              name="empCarTypeField"
              className="dropdown-stories-styles_spacing"
              onChange={event=>{carType = event.value}}
              onOptionRemove={function noRefCheck(){}}
              onOptionSelect={function noRefCheck(){}}
              options={[
                {
                  label: 'small',
                  value: 'small'
                },
                {
                  label: 'midsize',
                  value: 'midsize'
                },
                {
                  label: 'luxury_suv_van',
                  value: 'luxury_suv_van'
                }
              ]}
              placeholder="Select Car type"
            />
            <br/>
            <Dropdown
              name="empFuelTypeField"
              className="dropdown-stories-styles_spacing"
              onChange={event=>{fuelType = event.value}}
              onOptionRemove={function noRefCheck(){}}
              options={[
                {
                  label: 'petrol',
                  value: 'petrol'
                },
                {
                  label: 'diesel',
                  value: 'diesel'
                },
                {
                  label: 'hybrid',
                  value: 'hybrid'
                },
                {
                  label: 'lpg',
                  value: 'lpg'
                },
                {
                  label: 'cng',
                  value: 'cng'
                },
                {
                  label: 'electric',
                  value: 'electric'
                }
              ]}
              placeholder="Select Fuel type"
            />
            <br/>
            </div>
          <TextField
            name = "empDistField"
            placeholder="Distance"
            ref={empDistRef}
            type="number"
          /><br/>
          <Button type="submit" style={{width: 400}} color={Button.colors.PRIMARY}>Add Employee</Button>
          </form>
        </Box>
      </Modal>
      <Modal
        open={openVeh}
        onClose={handleCloseVeh}
      >
        <Box sx={style}>
          <header title='Manage' className="cardTitle">Add Vehicle</header>
        </Box>
      </Modal>
      <Modal
        open={openAllow}
        onClose={handleCloseAllow}
      >
        <Box sx={style}>
          <header title='Manage' className="cardTitle">Add Allowance</header>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
