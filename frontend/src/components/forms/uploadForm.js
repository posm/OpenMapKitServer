import React from 'react';
import {connect} from "react-redux";
import Upload from 'rc-upload';

import { Callout, Icon } from '@blueprintjs/core';


class UploadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
      error: false,
      loadingIndicator: false,
      errorMessage: ''
    }
    this.authBase64 = null;
    if (this.props.userDetails && this.props.userDetails.hasOwnProperty('username') && this.props.userDetails.username !== null) {
      this.authBase64 = new Buffer(
        `${this.props.userDetails.username}:${this.props.userDetails.password}`
      ).toString('base64');
    }
  }

  render() {
    const uploaderProps = {
      action: '/omk/odk/upload-form',
      headers: {
        Authorization: `Basic ${this.authBase64}`
      },
      multiple: true,
      beforeUpload(file) {
        console.log('beforeUpload', file.name);
      },
      onStart: (file) => {
        this.setState({loadingIndicator: true, error: false, success: false});
        console.log('onStart', file.name);
      },
      onSuccess: (file) => {
        this.setState({loadingIndicator: false, error: false, success: true});
        console.log('onSuccess', file);
      },
      onProgress(step, file) {
        console.log('onProgress', Math.round(step.percent), file.name);
      },
      onError: (err, response) => {
        console.log(err);
        this.setState({
          loadingIndicator: false,
          error: true,
          success: false,
          errorMessage: response.msg
        });
      }
    };
    return (<div className="container">
      {
        this.state.success && <Callout title="Success!" intent="success" className="upload-result">
            Your file(s) has been successfully uploaded and the new forms are already available
          </Callout>
      }
      {
        this.state.error && <Callout title="Error!" intent="danger" className="upload-result">
            {this.state.errorMessage
              ? this.state.errorMessage
              : 'Some error occurred while uploading your file(s)'
            }
          </Callout>
      }
      <Upload {...uploaderProps} ref="inner">
        <Callout title={this.state.loadingIndicator ? "Uploading..." : "Upload Form"}
          className={`upload-area ${this.state.loadingIndicator && 'loading-upload-area'}`}
        >
          <div className="pt-10">
            {this.state.loadingIndicator
              ? <Icon icon="refresh" className="spinning" iconSize={60} title="Uploading..."/>
              : <p>
                  Drag and drop here your XSL or XSLX files to upload to OpenMapKit Server.
                </p>
            }
          </div>
        </Callout>
      </Upload>
    </div>);
  }
}

const mapStateToProps = state => ({userDetails: state.auth.userDetails});

UploadForm = connect(mapStateToProps)(UploadForm);
export {
  UploadForm
};
