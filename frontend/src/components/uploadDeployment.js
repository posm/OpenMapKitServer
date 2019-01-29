import React from 'react';
import {connect} from "react-redux";
import Upload from 'rc-upload';
import { Callout, Button } from '@blueprintjs/core';
import { ListGroup, ListGroupItem, Grid, Row, Col } from 'react-bootstrap';

import { cancelablePromise } from '../utils/promise';
import { deploymentList, createDeploymentFolder } from '../network/deployments';


class UploadDeployment extends React.Component {
  getDeploymentsPromise;
  createDeploymentPromise;

  constructor(props) {
    super(props);
    this.state = {
      success: false,
      error: false,
      stage: 0,
      deployments: [],
      selectedDeployment: '',
      newDeploymentName: '',
      folderNameAlreadyExists: false,
      validFolderName: false
    }
    this.authBase64 = null;
    if (this.props.userDetails && this.props.userDetails.hasOwnProperty('username') && this.props.userDetails.username !== null) {
      this.authBase64 = new Buffer(
        `${this.props.userDetails.username}:${this.props.userDetails.password}`
      ).toString('base64');
    }
  }

  componentWillUnmount() {
    this.getDeployments && this.getDeploymentsPromise.cancel();
  }

  componentDidMount() {
    this.getDeployments();
  }

  getDeployments = () => {
    this.getDeploymentsPromise = cancelablePromise(
      deploymentList()
    );
    this.getDeploymentsPromise.promise
      .then(data => this.setState({deployments: data}))
      .catch(e => console.log(e));
  }

  selectDeployment = name => {
    this.setState({
      selectedDeployment: name,
      stage: 1
    });
  }
  unselectDeployment = () => {
    this.setState({
      selectedDeployment: '',
      stage: 0
    });
  }
  newFolderNameValue = e => {
    this.setState({
      'newDeploymentName': e.target.value,
      'folderNameAlreadyExists': e.target.value &&
        this.state.deployments.map(i => i.name).includes(e.target.value),
      'validFolderName': !/[^a-zA-Z0-9\-\/]/.test( e.target.value )
    });
  }
  createDeploymentFolder = () => {
    this.createDeploymentPromise = cancelablePromise(
      createDeploymentFolder(
        this.state.newDeploymentName,
        this.props.userDetails.username,
        this.props.userDetails.password
      )
    );
    this.createDeploymentPromise.promise
      .then(data => this.setState(
        {stage: 1, selectedDeployment: this.state.newDeploymentName}
      )).catch(e => console.log(e));
  }

  renderDeploymentList = () => {
    return(
      <div className="deployments mt-10">
        <h2>Deployments</h2>
        <p> Select a deployment folder to upload files to:</p>
        <Grid className="deployments-list">
          <Row>
            <Col xs={12} md={6} mdOffset={3}>
              {this.state.deployments.length
                ? <ListGroup>
                    {this.state.deployments.map(
                      (deployment, key) =>
                      <ListGroupItem key={key}>
                        <div>
                          <h3 className="display-inline"
                            onClick={e => this.selectDeployment(deployment.name)}
                          >
                            { deployment.name }
                          </h3>
                        </div>
                      </ListGroupItem>
                    )}
                  </ListGroup>
                : <span>No deployments were found.</span>
              }
            </Col>
          </Row>
        </Grid>
        <p>Or create a new deployment folder:</p>
        <input type="text" dir="auto" placeholder="New folder name"
          className={`pt-input mb-10 ${this.state.folderNameAlreadyExists && 'pt-intent-danger'}`}
          onChange={e => this.newFolderNameValue(e)}
        />
        {this.state.folderNameAlreadyExists &&
          <p className="deployment-alert">
            There is already a deployment folder with this name.
          </p>
        }
        {(this.state.newDeploymentName && !this.state.validFolderName) &&
          <p className="deployment-alert">
            Please don't use spaces or special characters on the folder name.
          </p>
        }
        {(this.state.newDeploymentName &&
          !this.state.folderNameAlreadyExists &&
          this.state.validFolderName
          ) &&
          <p>
            <Button className="pt-button pt-intent-success"
              onClick={e => this.createDeploymentFolder()}
            >
              Create folder
              <span className="pt-icon-standard pt-icon-arrow-right pt-align-right"></span>
            </Button>
          </p>
        }
      </div>
    );
  }

  render() {
    const uploaderProps = {
      action: '/omk/odk/upload-deployment',
      headers: {
        Authorization: `Basic ${this.authBase64}`
      },
      multiple: true,
      beforeUpload(file) {
        console.log('beforeUpload', file.name);
      },
      onStart: (file) => {
        this.setState({error: false});
        this.setState({success: false});
        console.log('onStart', file.name);
      },
      onSuccess: (file) => {
        this.setState({success: true});
        this.setState({error: false});
        console.log('onSuccess', file);
      },
      onProgress(step, file) {
        console.log('onProgress', Math.round(step.percent), file.name);
      },
      onError: (err) => {
        this.setState({error: true});
        this.setState({success: false});
      }
    };
    return (
      <div className="container">

        {
          this.state.success &&
          <Callout title="Success!" intent="success" className="upload-result">
            Your file(s) has been successfully uploaded and are already available on the deployments
          </Callout>
        }
        {
          this.state.error &&
          <Callout title="Error!" intent="danger" className="upload-result">
            Some error occurred while uploading your file(s).
          </Callout>
        }
        {
          this.state.stage === 0
            ? this.renderDeploymentList()
            : <div className="deployments mt-10">
                <h3>Upload deployment files to <u>{this.state.selectedDeployment}</u></h3>
                <Upload {...uploaderProps} ref="inner">
                  <Callout title={"Upload files"} className="upload-area">
                    Drag and drop here your deployment files.<br />
                  Accepted formats: <i>.osm, .geojson, .mbtiles</i>.
                  </Callout>
                </Upload>
                <Button className="pt-button pt-intent-warning mt-10"
                  onClick={e => this.unselectDeployment()}
                >
                  <span className="pt-icon-standard pt-icon-arrow-left pt-align-left"></span>
                  Select other folder
                </Button>
              </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({userDetails: state.auth.userDetails});

UploadDeployment = connect(mapStateToProps)(UploadDeployment);

export {
  UploadDeployment
};
