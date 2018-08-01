import React from 'react';
import {connect} from "react-redux";
import Upload from 'rc-upload';

import {Callout} from '@blueprintjs/core';


class UploadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
      error: false,
    }
    this.authBase64 = null;
    if (this.props.userDetails && this.props.userDetails.hasOwnProperty('username') && this.props.userDetails.username !== null) {
      this.authBase64 = new Buffer(this.props.userDetails.username + ':' + this.props.userDetails.password).toString('base64');
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
    return (<div className="container">
      {
        this.state.success && <Callout title="Success!" intent="success" className="upload-result">
            Your file(s) has been successfully uploaded and the new forms are already available
          </Callout>
      }
      {
        this.state.error && <Callout title="Error!" intent="danger" className="upload-result">
            Some error occurred while uploading your file(s).
          </Callout>
      }
      <Upload {...uploaderProps} ref="inner">
        <Callout title={"Upload Form"} className="upload-area">
          Drag and drop here your XSL or XSLX files to upload to OpenMapKit Server.
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
