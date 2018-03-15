import React from 'react';
import { connect } from "react-redux";
import { Route, Redirect } from 'react-router'

import {
  Button, Popover, Menu, MenuItem, Position, InputGroup, Icon
} from "@blueprintjs/core";
import { Cell, Column, Table } from "@blueprintjs/table";
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime";
import { Grid, Row, Col } from 'react-bootstrap';

import { getSubmissions, submitToOSM } from '../network/submissions';
import { formList } from '../network/formList';
import { cancelablePromise } from '../utils/promise';


const jsDateFormatter: IDateFormatProps = {
    // note that the native implementation of Date functions differs between browsers
    formatDate: date => date.toISOString().split('T')[0],
    parseDate: str => new Date(str),
    placeholder: "YYYY-MM-DD",
};

class SubmissionMenu extends React.Component {
  submitToOSMPromise;

  submitToOSM = () => {
    this.submitToOSMPromise = cancelablePromise(
      submitToOSM(this.props.formId)
    );
    this.submitToOSMPromise.promise.then(
      r => {
        // need to implement some notification system
        console.log('changeset submitted//');
      }
    ).catch(e => console.log(e));
  }

  render() {
    const omkMenu =
    <Menu>
      <MenuItem className="pt-minimal" icon="th" label="Download CSV"
        href={`/omk/odk/submissions/${this.props.formId}.csv`}
        />
      <MenuItem className="pt-minimal" icon="code" label="Download JSON" download
        href={`/omk/odk/submissions/${this.props.formId}.json`}
        />
      <MenuItem className="pt-minimal" icon="compressed" label="Download ZIP"
        href={`/omk/odk/submissions/${this.props.formId}.zip`}
        />
    </Menu>;
    const osmMenu =
    <Menu>
      <MenuItem className="pt-minimal" label="All OSM data" download
        href={`/omk/odk/submissions/${this.props.formId}.osm`}
        />
      <MenuItem className="pt-minimal" label="Unsubmitted OSM data"
        download={`${this.props.formId}-unsubmitted.osm`}
        href={`/omk/odk/submissions/${this.props.formId}.osm?unsubmitted=true`}
        />
      <MenuItem className="pt-minimal" label="Conflicting OSM data"
        download={`${this.props.formId}-conflicting.osm`}
        href={`/omk/odk/submissions/${this.props.formId}.osm?conflicting=true`}
        />
    </Menu>;
    return (
      <div>
        <Popover content={omkMenu} position={Position.BOTTOM} className="pt-intent-default">
          <Button icon="link">ODK Data <Icon icon="caret-down" /></Button>
        </Popover>
        <Popover content={osmMenu} position={Position.BOTTOM} className="pt-intent-default">
          <Button icon="path-search">OSM Data <Icon icon="caret-down" /></Button>
        </Popover>
        <Button icon="send-to-map" text="Submit to OSM" onClick={this.submitToOSM} />
      </div>
    );
  }
};

class SubmissionList extends React.Component {
  getSubmissionsPromise;
  getFormDetailsPromise;

  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
      filteredSubmissions: [],
      formName: '',
      totalSubmissions: 0,
      filterDay: null,
      filterDeviceId: ''
    }
  }

  isAuthenticated() {
    return this.props.userDetails &&
        this.props.userDetails.hasOwnProperty('username') &&
        this.props.userDetails.username !== null
  }
  componentWillUnmount() {
    this.getSubmissionsPromise && this.getSubmissionsPromise.cancel();
    this.getFormDetailsPromise && this.getFormDetailsPromise.cancel();
  }
  componentDidMount() {
    this.getSubmissions();
    this.getFormDetails();
  }

  handleFilterDayChange = (date) => {
    if (date) {
      this.setState({ filterDay: date.toISOString().split('T')[0]});
    }
  }
  handleFilterDeviceIdChange = (event) => {
    this.setState({ filterDeviceId: event.target.value });
  }

  filterSubmissions = () => {
    let filtered = this.state.submissions;
    if (this.state.filterDay) {
      filtered = filtered.filter(
        item => item[3].startsWith(this.state.filterDay)
      );
    }
    if (this.state.filterDeviceId) {
      filtered = filtered.filter(
        item => item[2].toString().includes(this.state.filterDeviceId)
      );
    }
    this.setState({ filteredSubmissions: filtered });
  }

  clearFilter = () => {
    this.setState({ filteredSubmissions: this.state.submissions });
    this.setState({ filterDay: null });
    this.setState({ filterDeviceId: '' });
  }

  getFormDetails = () => {
    this.getFormDetailsPromise = cancelablePromise(
      formList(this.props.formId)
    );
    this.getFormDetailsPromise.promise.then(
      r => {
        this.setState({ formName: r.xforms.xform[0].name });
        this.setState({ totalSubmissions: r.xforms.xform[0].totalSubmissions });
      }
    ).catch(e => console.log(e));
  }

  getSubmissions = () => {
    this.getSubmissionsPromise = cancelablePromise(
      getSubmissions(
        this.props.formId,
        this.props.userDetails.username,
        this.props.userDetails.password
      )
    );
    this.getSubmissionsPromise.promise.then(
      r => {
        let data = r.map(i => [
          i.start,
          i.end,
          i.deviceid,
          i.meta.submissionTime,
          i.image,
          Object.values(i).filter(
            entry => typeof(entry) === 'string' && entry.endsWith('.osm')
          )[0],
          i.meta.instanceId.split(':')[1],
        ]);
        this.setState({ submissions: data });
        this.setState({ filteredSubmissions: data });
      }
    ).catch(e => console.log(e));
  }

  renderCell = (row, column) => <Cell>{this.state.filteredSubmissions[row][column]}</Cell>;
  renderCellImage = (row, column) => <Cell>
    {this.state.filteredSubmissions[row][column]
      ? <a href={`/omk/data/submissions/${this.props.formId}/${this.state.filteredSubmissions[row][column+2]}/${this.state.filteredSubmissions[row][column]}`}>
          Download image
        </a>
      : <span>No image</span>
    }

  </Cell>;
  renderCellLink = (row, column) => <Cell>
    <a href={`/omk/data/submissions/${this.props.formId}/${this.state.filteredSubmissions[row][column+1]}/${this.state.filteredSubmissions[row][column]}`}>
      OSM File
    </a>
  </Cell>;

  render() {
    const isAuthenticated = this.isAuthenticated();
    return(
      <div>
        {isAuthenticated
          ? <div>
              <div className="submissions-info">
                <h2>{ this.state.formName }</h2>
                <p>Total submissions: { this.state.totalSubmissions }</p>
                <SubmissionMenu formId={this.props.formId} />
              </div>
              <Grid className="filters container">
                <Row>
                  <Col xs={12} md={2} mdOffset={3} className="pt-input-group">
                    <label for="filter-day" className="display-block">Submission Date</label>
                    <DateInput {...jsDateFormatter}
                      id="filter-day"
                      onChange={this.handleFilterDayChange}
                      />
                  </Col>
                  <Col xs={12} md={2} className="pt-input-group">
                    <label for="filter-deviceid" className="display-block">Device ID</label>
                    <input id="filter-deviceid" type="text" className="pt-input pt-minimal"
                      value={this.state.filterDeviceId}
                      onChange={this.handleFilterDeviceIdChange}
                      />
                  </Col>
                  <Col xs={12} md={1} className="pt-input-group">
                    <Button className="pt-intent-success filter-btn"
                      icon="filter" text="Filter" onClick={this.filterSubmissions}
                      />
                  </Col>
                  <Col xs={12} md={1} className="pt-input-group">
                    <Button className="pt-intent-danger filter-btn"
                      icon="filter-remove" text="Clear" onClick={this.clearFilter}
                      />
                  </Col>
                </Row>
              </Grid>
              <Table className="submissions-table center-block"
                columnWidths={[210,210,170,230,190,190]}
                numRows={this.state.filteredSubmissions.length}
              >
                <Column name="Start" cellRenderer={this.renderCell} />
                <Column name="End" cellRenderer={this.renderCell} />
                <Column name="Device ID" cellRenderer={this.renderCell} />
                <Column name="Submission Time" cellRenderer={this.renderCell} />
                <Column name="Image" cellRenderer={this.renderCellImage} />
                <Column name="Download" cellRenderer={this.renderCellLink} />
              </Table>
            </div>
          : <Redirect to='/login/' />
        }
      </div>
    );
  }
}

SubmissionList = connect(
  (state, props) => ({
    userDetails: state.auth.userDetails,
    formId: props.match.params.formId
  })
)(SubmissionList)

export {SubmissionList};
