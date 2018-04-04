import React from 'react';
import { connect } from "react-redux";
import { Button } from '@blueprintjs/core';
import { ListGroup, ListGroupItem, Grid, Row, Col } from 'react-bootstrap';

import { cancelablePromise } from '../../utils/promise';
import { archivedForms, restoreForm } from '../../network/formManagement';


class Form extends React.Component {
  restoreFormPromise;

  state = {
    visible: true
  }

  componentWillUnmount() {
      this.restoreFormPromise && this.restoreFormPromise.cancel();
  }

  restoreForm = (event) => {
    this.restoreFormPromise = cancelablePromise(
      restoreForm(
        this.props.formName,
        this.props.userDetails.username,
        this.props.userDetails.password
      )
    );
    this.restoreFormPromise.promise
      .then(
        data => {
          this.setState({visible: false})
        }
      ).catch(e => console.log(e));
  }

  render() {
    return(
      <ListGroupItem>
        {this.state.visible
          ? <div>
              <h3 className="display-inline">{ this.props.formName }</h3>
              <Button className="display-inline restore-btn" icon="refresh"
                intent="success" text="Restore" onClick={this.restoreForm}
              />
            </div>
          : <div>
              <h3>Form Restored</h3>
            </div>
        }
      </ListGroupItem>
    );
  }
}


class ArchivedForms extends React.Component {
  getArchivedFormsPromise;

  state = {
    forms: []
  }

  componentWillUnmount() {
      this.getArchivedFormsPromise && this.getArchivedFormsPromise.cancel();
  }

  componentDidMount() {
    this.getArchivedForms();
  }

  getArchivedForms = () => {
    this.getArchivedFormsPromise = cancelablePromise(
      archivedForms(this.props.userDetails.username, this.props.userDetails.password)
    );
    this.getArchivedFormsPromise.promise
      .then(data => this.setState({forms: data.forms}))
      .catch(e => console.log(e));
  }

  render() {
    return(
      <div className="archived-forms">
        <h2>Archived Forms</h2>
        <Grid className="archived-form-list">
          <Row>
            <Col xs={12} md={4} mdOffset={4}>
              {this.state.forms.length
                ? <ListGroup>
                    {this.state.forms.map(
                      (form, key) =>
                      <Form key={key} userDetails={this.props.userDetails} formName={form} />
                    )}
                  </ListGroup>
                : <span>No archived forms were found.</span>
              }
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

ArchivedForms = connect(
  (state, props) => ({
    userDetails: state.auth.userDetails,
  })
)(ArchivedForms);

export { ArchivedForms };
