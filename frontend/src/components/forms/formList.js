import React from 'react';
import { Link } from "react-router-dom";
import { Map } from 'immutable';
import { AnchorButton, Button, ButtonGroup, Card, Elevation } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-bootstrap';

import { formList } from '../../network/formList';
import { cancelablePromise } from '../../utils/promise';
import { withFetchDataSilent } from '../fetch_data_enhancer';


type propsType = {
  data: Map<string, any>
};

class FormList extends React.Component<any, propsType, any> {

  renderCol(form) {
    return(
      <Card interactive={true} elevation={Elevation.TWO}>
          <h5 className="card-title">{ form.get('name') }</h5>
        <div className="text-left form-info">
          <p>Number of Submissions: { form.get('totalSubmissions') }</p>
          <p>Form ID: <code>{ form.get('formID') }</code></p>
          <ButtonGroup fill={true} vertical={true} large={false}>
            <Link to={`/submissions/${form.get('formID')}`}>
              <Button icon="list">
                View submissions
              </Button>
            </Link>
            <AnchorButton icon="th" download href={`/omk/data/forms/${form.get('formID')}.xlsx`}>
              XSLX Form
            </AnchorButton>
            <AnchorButton icon="code" download href={`/omk/data/forms/${form.get('formID')}.xml`}>
              XForm XML
            </AnchorButton>
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
