import './App.css';
import React, { useRef } from 'react';
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
import { Button, TextField, Dropdown, Divider, Checkbox, Flex, SplitButton } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import DataTable from 'react-data-table-component';
import { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import {firestore} from "./firebase";
import {addDoc, collection, getDocs} from "@firebase/firestore";
import { fontSize } from '@mui/system';
import { writeFile, utils } from 'xlsx';

function App() {
  var ref = null;
  const monday = mondaySdk();
  monday.setToken(process.env.REACT_APP_MONDAY_TOKEN);
  monday.api(`query { users { id, name } }`).then(res => {
    ref = collection(firestore,"companies/" + res.account_id + "/employees");
  });
  const [car_ty,setCar_Ty] = React.useState("");
  const [fuel_ty,setFuel_Ty] = React.useState("");
  const [openEmp, setOpenEmp] = React.useState(false);
  const [openVeh, setOpenVeh] = React.useState(false);
  const [openAllow, setOpenAllow] = React.useState(false);
  const [isPublic, setPublic] = React.useState(false);
  const [empID,setEmpID] = React.useState("");
  const [empName,setEmpName] = React.useState("");
  const [dis,setDis] = React.useState("");
  const [eData, setEData] = React.useState([]);
  const [sData,setSData] = React.useState([]);
  const [searchResult,setSearchResult] = React.useState(false);
  const handleOpenEmp = () => setOpenEmp(true);
  const handleOpenVeh = () => setOpenVeh(true);
  const handleOpenAllow = () => setOpenAllow(true);
  const handleCloseEmp = () => {
    setOpenEmp(false);
    fetchEmployees();
  }
  const handleCloseVeh = () => setOpenVeh(false);
  const handleCloseAllow = () => {setOpenAllow(false);setSearchResult(false);}
  
  const empIdRef = useRef();
  const empNameRef = useRef();
  const empDistRef = useRef();
  
  const fuel_cost = {
    'petrol': 120,
    'diesel': 132,
    'lpg': 83,
    'hybrid': 122.1,
    'cng': 112,
    'electric': 60
  }
  
  var carType, fuelType;
  const changeSearch = () => {
    setSearchResult(!searchResult)
  }
  
  const changePublic = () => {
    setPublic(!isPublic);
  }
  
  const ExportData = () => {
    const filename='report.xlsx';
    var ws = utils.json_to_sheet(eData);
    var wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "People");
    writeFile(wb,filename);
  }
  
  const fetchEmployees = async() => {
    var result = [];
    monday.api(`query { users { id, name } }`).then(async(res) => {
      ref = collection(firestore,"companies/" + res.account_id + "/employees");
      const querySnapshot = await getDocs(ref);
      querySnapshot.docs.forEach((doc)=>{
        console.log(doc);
        result.push(doc.data());
      });
      setEData(result);
      console.log(result);
    });
  }
  
  useEffect(()=>{
    fetchEmployees();
  }, []);

    function editEmp(updatedEmp){
      ref
      .doc(updatedEmp.id)
      .update(updatedEmp)
      .catch((err)=>
        alert(err)
        )
    }
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
      borderColor: poolColors(employeeEmissions.length),
      backgroundColor: poolColors(employeeEmissions.length),
      tension: 0.3,
      lineTension: 0.5
    }]
  };
  const employeeDetails = async(empId) =>{
    var result = eData;
    // monday.api(`query { users { id, name } }`).then(async(res) => {
    //   ref = collection(firestore,"companies/" + res.account_id + "/employees");
    //   const querySnapshot = await getDocs(ref);
    //   querySnapshot.docs.forEach((doc)=>{
    //     result.push(doc.data());
    //   })
      for (var i=0; i < result.length; i++) {
        if (result[i].id === empId) {
            setSData(result[i]);
            setSearchResult(!searchResult)
        }
    }

    // });
    

  }

  function poolColors(a) {
    var pool = [];
    for(var i = 0; i < a; i++) {
        var cl = getRandomColor();
        while(pool.includes(cl)){
          cl = getRandomColor();
        }
        pool.push(cl);
    }
    return pool;
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    RadialLinearScale,
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
  
  const fuelTypesList = eData.map(({ fuel_type }) => fuel_type);
  const fuelCounts = {};

  for (const f of fuelTypesList) {
    fuelCounts[f] = fuelCounts[f] ? fuelCounts[f] + 1 : 1;
  }

  const fuelPlotData = {
    labels: Object.keys(fuelCounts),
    datasets: [{
      data: Object.values(fuelCounts),
      backgroundColor: poolColors(6),
    }]
  }
  
  const fuelEmissionData = {
    labels: Object.keys(fuel_cost),
    datasets: [{
      data: Object.values(fuel_cost),
      backgroundColor: poolColors(6),
    }]
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
    <Flex>
      <header title='EconiumTitle' className="cardTitle" style={{fontSize: 40}}>Econium</header>
      <SplitButton
        onClick={ExportData}
        onSecondaryDialogDidHide={function noRefCheck(){}}
        onSecondaryDialogDidShow={function noRefCheck(){}}
        secondaryDialogContent={
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <Button className='mgmtButtons' onClick = {handleOpenEmp} color = {Button.colors.PRIMARY}>Add Employee</Button>
            <Button className='mgmtButtons' onClick = {handleOpenAllow} color = {Button.colors.POSITIVE}>Edit Employee Details</Button>
          </div>
        }
      >
        Manage Employee
      </SplitButton>
    </Flex>
      <div className='panel-2'>
        <Box className='card'>
          <header title='Manage' className="cardTitle">Leaderboard</header>
          <Divider />
          <DataTable
            columns={tData.columns}
            data={tData.data}
            defaultSortFieldId={3}
            striped
            pagination
            className='leaderboard'
          />
        </Box>
        <Box className='card'>
          <PolarArea data={fuelEmissionData} height="30%" options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                ticks: {
                  display: false
                }
              }
            }
          }}/>
        </Box>
        <Box className='card'>
          <PolarArea data={fuelEmissionData} height="30%" options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                ticks: {
                  display: false
                }
              }
            }
          }}/>
        </Box>
      </div>
      <div className='panel-2'>
        <Box className='card'>
          <Bar data={data} options={{plugins: {
              legend: {
                display: false,
              }
          }}} />
        </Box>
        <Box className='card'>
          <Doughnut data={fuelPlotData} height="30%" options={{
          responsive: true,
          maintainAspectRatio: false,
        }}/>
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
          <header title='Manage' className="cardTitle">Enter Employee ID</header>
          <div className="empSearch" style={!searchResult ? {} : { display: 'none' }}>
          <p>Enter the employee ID</p>
          <TextField name="empSearchId"
          placeholder="Employee ID"
          value={empID}
          onChange={setEmpID}/>
          </div>
          <Button type="submit" style={!searchResult ? {width:150,marginLeft:110} : { display: 'none' }} color={Button.colors.POSITIVE} onClick={()=>{employeeDetails(empID)}}>Search Employee</Button>          
          <div style={searchResult ? {} : { display: 'none' }}>
          <div>
              <p>Employee ID :{sData.id}</p>
            </div>
              <p>Employee Name: {sData.name}</p> 
              <TextField
               name="name"
               placeholder="Enter the Employee Name"
               onChange={(e)=>setEmpName(e.target.value)} 
               />
            
            <br/>
            <p>Car Type: {sData.car_type}</p>
            <Dropdown
              name="empCarTypeFieldEdit"
              className="dropdown-stories-styles_spacing"
              onChange={(e)=>{setCar_Ty(e)}}
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
            
            <p>Fuel Type: {sData.fuel_type}</p>
            <Dropdown
                name="empFuelTypeFieldEdit"
                className="dropdown-stories-styles_spacing"
                onChange={(e)=>setFuel_Ty(e.value)}
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
              <p>Distance: {sData.distance}</p>
              <TextField
                name = "empDistField"
                placeholder="Distance"
                type="number"
                onChange={(e)=>setDis(e.target.value)}
          /><br/>
          <Button type="submit" onClick={()=>{
            editEmp({id:sData.id,name:empName,car_type:car_ty,fuel_type:fuel_ty,distance:dis})
          }} style={{width: 400}} color={Button.colors.PRIMARY}>Edit</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
