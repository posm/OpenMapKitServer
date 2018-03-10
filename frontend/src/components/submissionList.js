import React from 'react';
import { connect } from "react-redux";

import {
  Button, Popover, Menu, MenuItem, Position
} from "@blueprintjs/core";
import { Cell, Column, Table } from "@blueprintjs/table";
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime";

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
      <MenuItem className="pt-minimal" icon="code" label="Download JSON"
        href={`/omk/odk/submissions/${this.props.formId}.json`}
        />
      <MenuItem className="pt-minimal" icon="compressed" label="Download ZIP"
        href={`/omk/odk/submissions/${this.props.formId}.zip`}
        />
    </Menu>;
    const osmMenu =
    <Menu>
      <MenuItem className="pt-minimal" label="All OSM data"
        href={`/omk/odk/submissions/${this.props.formId}.osm`}
        />
      <MenuItem className="pt-minimal" label="Unsubmitted OSM data"
        href={`/omk/odk/submissions/${this.props.formId}.osm?unsubmitted=true`}
        />
      <MenuItem className="pt-minimal" label="Conflicting OSM data"
        href={`/omk/odk/submissions/${this.props.formId}.osm?conflicting=true`}
        />
    </Menu>;
    return (
      <div>
        <Popover content={omkMenu} position={Position.BOTTOM} className="pt-intent-default">
          <Button icon="link" text="OMK Data" />
        </Popover>
        <Popover content={osmMenu} position={Position.BOTTOM} className="pt-intent-default">
          <Button icon="path-search" text="OSM Data" />
        </Popover>
        <Button icon="send-to-map" text="Submit to OSM" onClick={this.submitToOSM}/>
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
      filterDay: new Date()
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

  filterSubmissions = () => {
    const filtered = this.state.submissions.filter(
      item => item[3].startsWith(this.state.filterDay)
    );
    this.setState({ filteredSubmissions: filtered });
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
        let data = r.map(
          i => [i.start, i.end, i.deviceid, i.meta.submissionTime, i.building_placeholder]
        );
        this.setState({ submissions: data });
        this.setState({ filteredSubmissions: data });
      }
    ).catch(e => console.log(e));
  }

  renderCell = (row, column) => <Cell>{this.state.filteredSubmissions[row][column]}</Cell>;
  renderCellLink = (row, column) => <Cell>
    <a href={`/omk/odk/submissions/${this.props.formId}/${this.state.filteredSubmissions[row][column]}`}>
      {this.state.filteredSubmissions[row][column]}
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
              <div className="filters">
                <DateInput {...jsDateFormatter}
                  defaultValue={new Date()}
                  onChange={this.handleFilterDayChange}
                />
              <Button icon="filter" text="Filter" onClick={this.filterSubmissions}/>
              </div>
              <Table className="submissions-table" numRows={this.state.filteredSubmissions.length}>
                <Column name="Start" cellRenderer={this.renderCell} />
                <Column name="End" cellRenderer={this.renderCell} />
                <Column name="Device ID" cellRenderer={this.renderCell} />
                <Column name="Submission Time" cellRenderer={this.renderCell} />
                <Column name="Download" cellRenderer={this.renderCellLink} />
              </Table>
            </div>
          : <h2>Access Restricted</h2>
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
