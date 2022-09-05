import logo from './logo.svg';
import './App.css';
import React from 'react';
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css"
import { Button } from "monday-ui-react-core";

function App() {
  const monday = mondaySdk();
  return (
    <div className="App">
    <Button>Hello</Button>
    </div>
  );
}

export default App;
