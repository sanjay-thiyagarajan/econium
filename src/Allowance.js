import React from 'react';
import './App.css';
import { Button, TextField, Dropdown, Divider, Checkbox, Flex, SplitButton } from "monday-ui-react-core";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
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
        height: 'max-content',
        width: 'max-content'
      };
      const rows = [
        { id: 1, start: 'Hello', end: 'World', bonus: 'a' },
        { id: 2, start: 'DataGridPro', end: 'is Awesome', bonus: 'a' },
        { id: 3, start: 'MUI', end: 'is Amazing', bonus: 'a' },
      ];
      
      const columns = [
        { field: 'start', headerName: 'Start', width: 150, editable: true },
        { field: 'end', headerName: 'End', width: 150, editable: true },
        { field: 'bonus', headerName: 'Bonus', width: 150, editable: true }
      ];
  return (
    <Modal open={allowance}
    onClose={handleModal}>
        <Box sx={style}>
            <header className="cardTitle" title='Allowance Details'>Allowance Details</header>
            <DataGrid columns={columns} rows={rows} autoHeight={true}/>
            <Button style={{width: '100%', marginTop: 20}}>Save</Button>
        </Box>
    </Modal>
  )
}
