import React from 'react';
import {connect} from "react-redux";
import { Link } from "react-router-dom";
import { Button } from '@blueprintjs/core';
import { ListGroup, ListGroupItem, Grid, Row, Col } from 'react-bootstrap';

import { cancelablePromise } from '../../utils/promise';
import { deploymentList, createDeploymentFolder } from '../../network/deployments';


class SelectCreateDeployment extends React.Component {
  getDeploymentsPromise;
  createDeploymentPromise;

  constructor(props) {
    super(props);
    this.state = {
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
      selectedDeployment: name
    });
  }
  unselectDeployment = () => {
    this.getDeployments();
    this.setState({
      selectedDeployment: ''
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
      .then(data => {
        this.setState({newDeploymentName: ''});
        this.getDeployments();
      }).catch(e => console.log(e));
  }

  render() {
    return (
      <div className="container">
        <div className="deployments mt-20 mb-20">
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
                            <Link to={`/deployments/${deployment.name}`}>
                              <h3 className="display-inline">
                                { deployment.name }
                              </h3>
                            </Link>
                          </div>
                        </ListGroupItem>
                      )}
                    </ListGroup>
                  : <span>No deployments were found.</span>
                }
              </Col>
            </Row>
          </Grid>
          <div className="mb-10">
            <p>Or create a new deployment folder:</p>
            <input type="text" dir="auto" placeholder="New folder name"
              value={this.state.newDeploymentName}
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
            {(this.state.newDeploymentName && !this.state.folderNameAlreadyExists &&
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
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({userDetails: state.auth.userDetails});

SelectCreateDeployment = connect(mapStateToProps)(SelectCreateDeployment);

export {
  SelectCreateDeployment
};
