import React, { Component } from 'react';
import { Route } from "react-router-dom";

import { Header } from './components/header';
import { LoginPanel } from './components/loginPanel';
import logo from './logo.svg';
import './App.css';


class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Route path="/" component={LoginPanel}/>
      </div>
    );
  }
}

export default App;
