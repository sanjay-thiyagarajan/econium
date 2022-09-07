import React from 'react';
import './App.css';
import { Button, TextField, Dropdown, Divider, Checkbox, Flex, SplitButton } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
// import { DataGrid, GridRowsProp, GridColDef  } from '@mui/x-data-grid';
export default function Allowance({setAllowance, allowance}) {
    const handleModal = () =>{
        setAllowance(false)
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
    //   const rows= [
    //     { id: 1, col1: 'Hello', col2: 'World' },
    //     { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    //     { id: 3, col1: 'MUI', col2: 'is Amazing' },
    //   ];
      
    //   const columns = [
    //     { field: 'col1', headerName: 'Column 1', width: 150 },
    //     { field: 'col2', headerName: 'Column 2', width: 150 },
    //   ];
  return (
    <Modal open={allowance}
    onClose={handleModal}>
        <Box sx={style}>
            <header className="cardTitle" title='Allowance Details'>Allowance Details</header>
        </Box>
   
    </Modal>
  )
}
