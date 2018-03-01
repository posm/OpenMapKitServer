import React from 'react';
import { Map } from 'immutable';
import { AnchorButton, ButtonGroup, Card, Elevation, NonIdealState } from '@blueprintjs/core';
import { Grid, Row, Col, PageHeader } from 'react-bootstrap';
import DropzoneComponent from "react-dropzone-component";

import "react-dropzone-component/styles/filepicker.css";
import "dropzone/dist/dropzone.css";

import { formList } from '../network/formList';
import { cancelablePromise } from '../utils/promise';
import { withFetchDataSilent } from './fetch_data_enhancer';


export class UploadForm extends React.Component {
  constructor(props) {
     super(props);
     // For a full list of possible configurations,
     // please consult http://www.dropzonejs.com/#configuration
     this.djsConfig = {
       addRemoveLinks: true,
     };
     this.componentConfig = {
       iconFiletypes: ['.jpg', '.png', '.gif'],
       showFiletypeIcon: true,
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

     return <DropzoneComponent config={config} eventHandlers={eventHandlers} djsConfig={djsConfig} />
   }
}

type propsType = {
  data: Map<string, any>
};

class FormList extends React.Component<any, propsType, any> {

  renderCol(form) {
    return(
      <Card interactive={true} elevation={Elevation.TWO}>
        <h5>{ form.get('name') }</h5>
        <div className="text-left form-info">
          <p>Number of Submissions: { form.get('totalSubmissions') }</p>
          <p>Form ID: <code>{ form.get('formID') }</code></p>
          <ButtonGroup fill={true} vertical={true} large={false}>
            <AnchorButton icon="list">View submissions</AnchorButton>
            <AnchorButton icon="th" href={`http://localhost:3210/omk/data/forms/${form.get('formID')}.xlsx`}>
              XSLX Form
            </AnchorButton>
            <AnchorButton icon="code">XFORM XML</AnchorButton>
          </ButtonGroup>
        </div>
      </Card>
    );
  }

  renderRow(data, row) {
    return data.slice(
      row*4, (row+1)*4
    ).map(
      (form, i) =>
        <Col key={i} md={3} xs={12} className="forms-col">
          {this.renderCol(form)}
        </Col>
    );
  }
  render() {
    let data = [];
    let size = 0;
    try {
      data = this.props.data.get('data').get('xforms').get('xform');
      size = data.size;
    } catch (e) {
       if (e instanceof TypeError) {}
    }
    let rows = Math.floor(size / 4);
    return(
      <Grid className="forms-grid">
        {[...Array(rows + 1).keys()].map(
          i => <Row key={i} className="forms-row">{this.renderRow(data, i)}</Row>
        )}
      </Grid>
    );
  }
}


FormList = withFetchDataSilent(
  (props: propsType) => ({
    data: cancelablePromise(formList())
  }),
  (nextProps: propsType, props: propsType) => true,
  FormList
);

export { FormList };
