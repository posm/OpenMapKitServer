import React from 'react';
import { connect } from "react-redux";
import DropzoneComponent from "react-dropzone-component";

import "react-dropzone-component/styles/filepicker.css";
import "dropzone/dist/dropzone.css";


class UploadForm extends React.Component {
  constructor(props) {
     super(props);
     // For a full list of possible configurations,
     // please consult http://www.dropzonejs.com/#configuration
     this.authBase64 = null;
     if (this.props.userDetails &&
         this.props.userDetails.hasOwnProperty('username') &&
         this.props.userDetails.username !== null
       ) {
         this.authBase64 = new Buffer(
           this.props.userDetails.username + ':' + this.props.userDetails.password
         ).toString('base64');
       }
     this.djsConfig = {
       addRemoveLinks: false,
       headers: {
         'Access-Control-Allow-Headers': 'Authorization, X-Requested-With, Accept, Content-Type, Origin, Cache-Control, X-File-Name',
         'Authorization': `Basic ${this.authBase64}`
       }
     };
     this.componentConfig = {
       iconFiletypes: ['.xls', '.xlsx'],
       showFiletypeIcon: true,
       withCredentials: true,
       postUrl: '/omk/odk/upload-form'
     };

     // If you want to attach multiple callbacks, simply
     // create an array filled with all your callbacks.
     this.callbackArray = [() => console.log('Hi!'), () => console.log('Ho!')];
     // Simple callbacks work too, of course
     this.callback = () => console.log('Hello!');
     this.success = file => console.log('uploaded', file);
     this.removedfile = file => console.log('removing...', file);
     this.dropzone = null;
   }

   render() {
     const config = this.componentConfig;
     const djsConfig = this.djsConfig;

     // For a list of all possible events (there are many), see README.md!
     const eventHandlers = {
       init: dz => this.dropzone = dz,
       drop: this.callbackArray,
       addedfile: this.callback,
       success: this.success,
       removedfile: this.removedfile
     }

     return <DropzoneComponent className="center-block"
         config={config} eventHandlers={eventHandlers} djsConfig={djsConfig}
         />
   }
}

const mapStateToProps = state => ({
  userDetails: state.auth.userDetails
});

UploadForm = connect(mapStateToProps)(UploadForm);
export { UploadForm };
