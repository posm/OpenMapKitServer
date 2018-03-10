import React, { Component } from 'react';
import { Route } from "react-router-dom";

import { Header } from './components/header';
import { SubmissionList } from './components/submissionList';
import { LoginPanel } from './components/loginPanel';
import { FormList } from './components/forms/formList';
import { UploadForm } from './components/forms/uploadForm';
import './App.css';


class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Route exact path="/" component={FormList} />
        <Route exact path="/login" component={LoginPanel} />
        <Route exact path="/upload-form" component={UploadForm} />
        <Route exact path="/submissions/:formId" component={SubmissionList} />
      </div>
    );
  }
}

export default App;
