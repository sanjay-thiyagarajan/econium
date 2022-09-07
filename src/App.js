import './App.css';
import React, { useRef ,useEffect, useState} from 'react';
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
import { Button, TextField, Dropdown, Divider, Checkbox, Flex, SplitButton } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import DataTable from 'react-data-table-component';
import ecoBg from './assets/ecobg.jpg';
import Allowance from './Allowance';
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
  Filler,
} from 'chart.js';
import { Bar, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import {firestore} from "./firebase";
import {addDoc, collection, getDocs,doc, updateDoc } from "@firebase/firestore";
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
  const [isPub, setIsPub] = React.useState(false);
  const [empID,setEmpID] = React.useState("");
  const [empName,setEmpName] = React.useState("");
  const [allowance,setAllowance] = React.useState(false);
  const [dis,setDis] = React.useState("");
  const [eData, setEData] = React.useState([]);
  const [sData,setSData] = React.useState([]);
  const [percent,setPercent] = React.useState(0)
  const [searchResult,setSearchResult] = React.useState(false);
  const handleOpenEmp = () => setOpenEmp(true);
  const handleOpenAllow = () => setOpenAllow(true);
  const handleCloseEmp = () => {
    setOpenEmp(false);
    setPublic(false);
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
    'electric': 60,
    'public': 0
  }
  const car_type_cost = {
    'small': 1,
    'midsize': 2,
    'luxury_suv_van': 3,
    'bike':0.5
  }
  
  const [bonusDetails,setBonusDetails] = useState({
    50:0,
    40:0,
    30:0,
    15:0,
    5:0,
  });

  var carType, fuelType;
  
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
      var updateBonus = bonusDetails;
      querySnapshot.docs.forEach((doc)=>{
        var docData = doc.data()
        result.push(docData);
        if(docData.emission <=1000){
          updateBonus[50]+=1;
        }else if(docData.emission <=3000){
          updateBonus[40]+=1;
        }else if(docData.emission <=6000){
          updateBonus[30]+=1;
        }else if(docData.emission <=10000){
          updateBonus[15]+=1;
        }else{
          updateBonus[5]+=1;
        }
      });
      setEData(result);
      setBonusDetails(updateBonus);
      var emissionTotal = 0;
      for (var i=0; i < result.length; i++) {
        emissionTotal += result[i].emission;
      }
      var diff;
      var emission_avg = 1065100;
      if(emissionTotal<=emission_avg){
        diff = emission_avg - emissionTotal;
      }
      else{
        diff = emissionTotal - emission_avg;
      }
      setPercent(Math.round((diff/emission_avg)*100));
    });
  }
  
  useEffect(()=>{
    fetchEmployees();
  }, []);

  const editEmp = () =>{
    console.log(isPub);
    if(empName==="")
      {
        setEmpName(sData.name)
        console.log(sData.name)
      }
    if(car_ty===""){
      setCar_Ty(sData.car_type)
    }
    if(dis===0 || dis===""){
      setDis(sData.dis)
    }
    if(fuel_ty==="") {
      setFuel_Ty(sData.fuel_type)
    }
    var cost=dis;
    if(isPub){
      cost*=10
    }
    else{
      cost *= fuel_cost[fuel_ty.value] * car_type_cost[car_ty.value];
    }
        console.log(empID,empName,car_ty,fuel_ty,dis,cost)
          var result = eData;
          var updateVal = {}
          for( let i =0; i<result.length; i++){
            if(result[i].id == empID ){
              if(isPub)
              {
                result[i] = {name:empName,distance:Number(dis),car_type:'public',fuel_type:'public',isPublic:true,id:Number(empID),emission:Math.round(cost)};
                updateVal = {name:empName,distance:Number(dis),car_type:'public',fuel_type:'public',isPublic:true,id:Number(empID),emission:Math.round(cost)};
              }
              else{
                result[i] = {name:empName,distance:Number(dis),car_type:car_ty.value,fuel_type:fuel_ty.value,isPublic:false,id:Number(empID),emission:Math.round(cost)}
                updateVal = {name:empName,distance:Number(dis),car_type:car_ty.value,fuel_type:fuel_ty.value,isPublic:false,id:Number(empID),emission:Math.round(cost)};
              }
              }
          }
          console.log(updateVal);  
          monday.api(`query { users { id, name } }`).then(async(res) => {
            ref = collection(firestore,"companies/" + res.account_id + "/employees");
            const querySnapshot = await getDocs(ref);
            querySnapshot.docs.forEach(async(doc_)=>{
              if(doc_.data().id==empID){
                console.log(doc_.id)
                const employeeRef = doc(firestore, "companies/" + res.account_id + "/employees",doc_.id);
                await updateDoc(employeeRef, updateVal);
              }
            });
            //await updateDoc(ref,result)
          });  
      setSearchResult(!searchResult);
      setSData(sData);
      handleCloseAllow();
  }
  const handleEmpSave = async(e)=>{
      e.preventDefault();

      try {
        let data = {
          id: Number(eData.length+1),
          name: empNameRef.current.value,
          distance: Number(empDistRef.current.value),
          isPublic:isPublic
        }
        let cost = data.distance ;
        if(isPublic){
          cost *= 10 ;
          data['car_type']= 'public';
          data['fuel_type'] = 'public';
        }
        else{
          data['car_type']= carType;
          data['fuel_type'] = fuelType;
          cost *= fuel_cost[data.fuel_type] * car_type_cost[data.car_type];
        }
        data['emission'] = Math.round(cost);
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
        if (result[i].id == empId) {
          setSData(result[i]);
          setSearchResult(!searchResult);
          setIsPub(result[i].isPublic);
          console.log(result[i].isPublic);
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
    Legend,
    Filler
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

  const bonusPlotData = {
    labels: Object.keys(bonusDetails),
    datasets: [{
      data: Object.values(bonusDetails),
      backgroundColor: poolColors(5),
      label:"Bonus Range Distribution"
    }]
  }

  const fuelPlotData = {
    labels: Object.keys(fuelCounts),
    datasets: [{
      data: Object.values(fuelCounts),
      backgroundColor: poolColors(7),
    }]
  }
  
  const fuelEmissionData = {
    labels: Object.keys(fuel_cost),
    datasets: [{
      data: Object.values(fuel_cost),
      backgroundColor: poolColors(7),
      label:"Fuel-wise Emission"
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
      <Flex style={{paddingTop: 20, paddingLeft: 20}}>
        <Flex direction={Flex.directions.COLUMN} style={{marginLeft: 30}}>
          <header title='EconiumTitle' className="cardTitle" style={{fontSize: 40, marginRight: 10, marginBottom: 20, color: 'green'}}>Econium</header>
          <SplitButton
            onClick={ExportData}
            color={Button.colors.POSITIVE}
            onSecondaryDialogDidHide={function noRefCheck(){}}
            onSecondaryDialogDidShow={function noRefCheck(){}}
            secondaryDialogContent={
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <Button className='mgmtButtons' onClick = {handleOpenEmp} color = {Button.colors.PRIMARY}>Add Employee</Button>
                <Button className='mgmtButtons' onClick = {handleOpenAllow} color = {Button.colors.POSITIVE}>Edit Employee Details</Button>
                <Button className='mgmtButtons' onClick = {()=>{setAllowance(!allowance)}} color = {Button.colors.NEGATIVE}>Add Allowance</Button>
              </div>
            }
          >
          Employee Data
          </SplitButton>
        </Flex>
        <Box className='card' style={{backgroundImage: `url(${ecoBg})`, backgroundPosition: 'center center', marginLeft: 30, alignItems: 'center', display: 'inline-flex', color: 'white', borderRadius: 10, fontSize: 20, height: 100, justifyContent: 'center'}}>
          <Flex>Your company's carbon emission is &nbsp; <span style={{fontSize: 35}}>{percent}%</span> &nbsp; lesser when compared to the average emission</Flex>
        </Box>
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
          <header title='Manage' className="cardTitle">Fuel-wise Emission</header>
          <Divider />
          <PolarArea data={fuelEmissionData} options={{
            plugins: {
              legend: {
                display: true,
                position: "bottom"
              },
            },
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
          <header title='Manage' className="cardTitle">Bonus Range Distribution</header>
          <Divider />
          <Radar data={bonusPlotData} options={{
            plugins: {
              legend: {
                display: true,
                position: "bottom"
              },
            },
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
          plugins: {
            legend: {
              display: true,
              position: "bottom"
            },
          },
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
            value={"Employee ID: "+(eData.length+1)}
            disabled={true}
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
                },
                {
                  label: 'bike',
                  value: 'bike'
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
        open={openAllow}
        onClose={handleCloseAllow}
      >
        <Box sx={style}>
          <header title='Manage' style={!searchResult ? {} : { display: 'none' }} className="cardTitle">Enter Employee ID</header>
          <div className="empSearch" style={!searchResult ? {} : { display: 'none' }}>
          <p>Enter the employee ID</p>
          <TextField name="empSearchId"
          placeholder="Employee ID"
          type="number"
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
               value={sData.name}
               placeholder="Enter the Employee Name"
               onChange={setEmpName} 
               />
            <br/>
            <Checkbox
            isPub
            label="Public Transport"
            onChange={()=>{setIsPub(!isPub)
            console.log(!isPub
              )}}
            checked={isPub}
          />
            <p>Car Type: {sData.car_type}</p>
            <Dropdown
              name="empCarTypeFieldEdit"
              className="dropdown-stories-styles_spacing"
              //v={sData.car_type}
              onChange={setCar_Ty}
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
                //value={sData.fuel_type}
                onChange={setFuel_Ty}
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
                value={sData.distance}
                onChange={setDis}
          /><br/>
          <Button type="submit" onClick={()=>{
            editEmp()
          }} style={{width: 400}} color={Button.colors.PRIMARY}>Edit</Button>
          </div>
        </Box>
      </Modal>
      <Allowance setAllowance={setAllowance} allowance={allowance}/>
    </div>
  );
}

export default App;
