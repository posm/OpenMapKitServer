import React from 'react';
import {connect} from "react-redux";
import { Link } from "react-router-dom";
import Upload from 'rc-upload';
import { Callout, Button, Colors } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-bootstrap';

import { cancelablePromise } from '../../utils/promise';
import { deploymentList } from '../../network/deployments';


class UploadDeployment extends React.Component {
  getDeploymentsPromise;

  constructor(props) {
    super(props);
    this.state = {
      success: false,
      error: false,
      files: []
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
      .then(data => this.setState(
        {files: data.filter(i => i.name === this.props.deployment)[0].files})
      ).catch(e => console.log(e));
  }

  bytesToSize = bytes => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  render() {
    const uploaderProps = {
      action: `/omk/odk/deployments/${this.props.deployment}`,
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
        this.getDeployments();
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
      <div className="container mt-10 mb-20">
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
        <div className="deployments mt-20">
          <h3>Deployment - <i>{this.props.deployment}</i></h3>
          <hr />
          <Row className="ml-0 mr-0 mt-20 pt-10 pb-10 light-gray-5">
            <h4>Current files</h4>
            <Col xs={12} md={4} className="pt-input-group">
              <p><b>.geojson</b></p>
              {(this.state.files && this.state.files.geojson) &&
                this.state.files.geojson.map(
                  file => <p><a href={file.url} target="_blank">{file.name}</a> <i>({this.bytesToSize(file.size)})</i></p>)
              }
            </Col>
            <Col xs={12} md={4} className="pt-input-group">
              <p><b>.mbtiles</b></p>
              {(this.state.files && this.state.files.mbtiles) &&
                this.state.files.mbtiles.map(
                  file => <p><a href={file.url}>{file.name}</a> <i>({this.bytesToSize(file.size)})</i></p>)
              }
            </Col>
            <Col xs={12} md={4} className="pt-input-group">
              <p><b>.osm</b></p>
              {(this.state.files && this.state.files.osm) &&
                this.state.files.osm.map(
                  file => <p><a href={file.url} target="_blank">{file.name}</a> <i>({this.bytesToSize(file.size)})</i></p>)
              }
            </Col>
          </Row>
          <hr />
          <Upload {...uploaderProps} ref="inner">
            <Callout title={"Upload new files"} className="upload-area">
              Drag and drop here new deployment files.<br />
            Accepted formats: <code>.geojson</code>, <code>.mbtiles</code>, <code>.osm</code>
            </Callout>
          </Upload>
          <Link to="/deployments">
            <Button className="pt-button pt-intent-warning mt-10">
              <span className="pt-icon-standard pt-icon-arrow-left pt-align-left"></span>
              Select another folder
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}

UploadDeployment = connect(
  (state, props) => ({
    userDetails: state.auth.userDetails,
    deployment: props.match.params.deployment
  })
)(UploadDeployment);

export {
  UploadDeployment
};
