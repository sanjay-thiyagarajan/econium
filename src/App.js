import './App.css';
import React, { useRef } from 'react';
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
import { Button, TextField, Dropdown, Divider } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import DataTable from 'react-data-table-component';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {firestore} from "./firebase";
import {addDoc, collection, doc} from "@firebase/firestore";

function App() {
  var ref = null;
  const monday = mondaySdk();
  monday.setToken(process.env.REACT_APP_MONDAY_TOKEN);
  const [openEmp, setOpenEmp] = React.useState(false);
  const [openVeh, setOpenVeh] = React.useState(false);
  const [openAllow, setOpenAllow] = React.useState(false);
  const handleOpenEmp = () => setOpenEmp(true);
  const handleOpenVeh = () => setOpenVeh(true);
  const handleOpenAllow = () => setOpenAllow(true);
  const handleCloseEmp = () => setOpenEmp(false);
  const handleCloseVeh = () => setOpenVeh(false);
  const handleCloseAllow = () => setOpenAllow(false);
  
  const empIdRef = useRef();
  const empNameRef = useRef();
  const empModelRef = useRef();
  const empBrandRef = useRef();
  const empDistRef = useRef();

  const handleEmpSave = async(e)=>{
      e.preventDefault();
      try {
        let data = {
          id: empIdRef.current.value,
          name: empNameRef.current.value,
          model: empModelRef.current.value,
          distance: empDistRef.current.value
        };
        monday.api(`query { users { id, name } }`).then(res => {
          ref = collection(firestore,"companies/" + res.account_id + "/employees");
          addDoc(ref, data);
        });
      }
      catch(e){
          console.log(e);
      }
  };
  
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
    datasets: [{
      label: 'Your Company\'s Emission',
      data: [65, 59, 80, 81, 56, 55, 40, 33, 103, 95, 223, 67],
      fill: -1,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgb(75, 192, 192)',
      tension: 0.3
    }]
  };
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  const tData = {
    data: [
      { employeeId: 1, employeeName: 'John Doe', emission: 96 },
      { employeeId: 2, employeeName: 'Mark Alfred', emission: 234 },
      { employeeId: 3, employeeName: 'Dark Angel', emission: 90 },
      { employeeId: 4, employeeName: 'White Devil', emission: 543 },
    ],
    columns : [
      {name:'Employee ID', selector: 'employeeId', sortable: true},
      {name:'Employee Name', selector: 'employeeName', sortable: true},
      {name:'Emission', selector: 'emission', sortable: true}
    ]
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
        <div className='card'>
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
        </div>
        <div className='card'>
          <header title='Manage' className="cardTitle">Manage</header>
          <Divider />
          <Button className='mgmtButtons' onClick = {handleOpenEmp} style={{backgroundColor: '#0a3e0a'}}>Add Employee</Button>
          {/* <Button className='mgmtButtons' onClick = {handleOpenVeh} style={{backgroundColor: 'green'}}>Add Vehicle</Button> */}
          <Button className='mgmtButtons' onClick = {handleOpenAllow} style={{backgroundColor: 'aliceblue', color: 'black', borderColor: '#0a3e0a', border: '1px solid #0a3e0a'}}>Add Allowance</Button>
        </div>
      </div>
      <div className='card'>
        <Line type="line" data={data} style={{width: '43rem'}}/>
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
          <Dropdown
            name="empBrandField"
            className="dropdown-stories-styles_spacing"
            ref={empBrandRef}
            onInputChange={function noRefCheck(){}}
            onOptionRemove={function noRefCheck(){}}
            onOptionSelect={function noRefCheck(){}}
            options={[
              {
                label: 'Hyundai',
                value: 1
              },
              {
                label: 'Honda',
                value: 2
              },
              {
                label: 'Suzuki',
                value: 3
              }
            ]}
            placeholder="Select Car Brand"
          />
          <br/>
          <TextField
            name = "empModelField"
            placeholder="Car Model"
            ref={empModelRef}
          /><br/>
          <TextField
            name = "empDistField"
            placeholder="Distance"
            ref={empDistRef}
          /><br/>
          <Button type="submit" style={{width: 400, backgroundColor:'#0a3e0a'}} onClick={handleEmpSave}>Add Employee</Button>
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
