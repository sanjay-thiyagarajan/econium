import logo from './logo.svg';
import './App.css';
import React from 'react';
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
import { Button, TextField, Dropdown } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';


function App() {
  const monday = mondaySdk();
  const [openEmp, setOpenEmp] = React.useState(false);
  const [openVeh, setOpenVeh] = React.useState(false);
  const [openAllow, setOpenAllow] = React.useState(false);
  const handleOpenEmp = () => setOpenEmp(true);
  const handleOpenVeh = () => setOpenVeh(true);
  const handleOpenAllow = () => setOpenAllow(true);
  const handleCloseEmp = () => setOpenEmp(false);
  const handleCloseVeh = () => setOpenVeh(false);
  const handleCloseAllow = () => setOpenAllow(false);
  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
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
        </div>
        <div className='card'>
          <header title='Manage' className="cardTitle">Manage</header>
          <Button className='mgmtButtons' onClick = {handleOpenEmp} style={{backgroundColor: 'brown'}}>Add Employee</Button>
          <Button className='mgmtButtons' onClick = {handleOpenVeh} style={{backgroundColor: 'green'}}>Add Vehicle</Button>
          <Button className='mgmtButtons' onClick = {handleOpenAllow}>Add Allowance</Button>
        </div>
      </div>
      <div className='card'>
      </div>
      <Modal
        open={openEmp}
        onClose={handleCloseEmp}
      >
        <Box sx={style}>
          <header title='Manage' className="cardTitle">Add Employee</header>
          <br/>
          <TextField
            name = "empIdField"
            placeholder="Employee ID"
          /><br/>
          <TextField
            name = "empNameField"
            placeholder="Employee Name"
          /><br/>
          <Dropdown
            className="dropdown-stories-styles_spacing"
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
          /><br/>
          <TextField
            name = "empDistField"
            placeholder="Distance"
            type="number"
          /><br/>
          <Button style={{width: 400}}>Add Employee</Button>
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
