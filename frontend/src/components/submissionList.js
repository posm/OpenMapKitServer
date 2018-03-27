import React from 'react';
import { connect } from "react-redux";
import { Redirect } from 'react-router'
import moment from 'moment';

import {
  AnchorButton, Button, Popover, Menu, MenuItem, Position, Icon, Dialog, Intent
} from "@blueprintjs/core";
import { Cell, Column, Table } from "@blueprintjs/table";
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime";
import { Grid, Row, Col, Image } from 'react-bootstrap';

import { getSubmissions, submitToOSM } from '../network/submissions';
import { handleErrors } from '../utils/promise';
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
  constructor(props) {
    super(props);
    this.state = {
      activeBlob: '',
      downloadName:'',
      openDialog: false
    }
  }

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

  download = (urlEnding, filename) => {
    const authBase64 = new Buffer(
      this.props.userDetails.username + ':' + this.props.userDetails.password
    ).toString('base64');
    return fetch(`/omk/odk/submissions/${urlEnding}`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Basic ${authBase64}`
      }
    })
      .then(handleErrors)
      .then(res => res.blob())
      .then(blob => {
        const objURL = URL.createObjectURL(blob);
        this.setState({ activeBlob: objURL });
        this.setState({
          downloadName: filename ? filename : urlEnding.split('?')[0]
        });
      });
  }

  downloadCsv = (event) => {
    this.download(`${this.props.formId}.csv?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadJson = (event) => {
    this.download(`${this.props.formId}.json?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadAttachments = (event) => {
    this.download(`${this.props.formId}.zip?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadAllOsm = (event) => {
    this.download(`${this.props.formId}.osm?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadOsmUnsubmitted = (event) => {
    this.download(
      `${this.props.formId}.osm?unsubmitted=true&${this.props.filterParams}`,
      `${this.props.formId}-unsubmitted.osm`,
    );
    this.toggleDialog();
  }
  downloadOsmConflicting = (event) => {
    this.download(
      `${this.props.formId}.osm?conflicting=true&${this.props.filterParams}`,
      `${this.props.formId}-conflicting.osm`
    );
    this.toggleDialog();
  }

  toggleDialog = () => this.setState({ openDialog: !this.state.openDialog });

  renderDialog() {
    return (
      <Dialog
        icon="cloud-download"
        isOpen={this.state.openDialog}
        onClose={this.toggleDialog}
        title="Download file"
      >
        <div className="pt-dialog-body">
          <p>{this.state.downloadName}</p>
          <AnchorButton
            intent={Intent.PRIMARY}
            className="pt-small"
            text="Download"
            download={this.state.downloadName}
            href={this.state.activeBlob}
          />
        </div>
      </Dialog>
    );
  }

  render() {
    const omkMenu = <Menu>
      <MenuItem className="pt-minimal" icon="th" label="Download CSV"
        onClick={this.downloadCsv}
        />
      <MenuItem className="pt-minimal" icon="code" label="Download JSON"
        onClick={this.downloadJson}
        />
      <MenuItem className="pt-minimal" icon="compressed" label="Download Attachments"
        onClick={this.downloadAttachments}
        />
    </Menu>;
    const osmMenu = <Menu>
        <MenuItem className="pt-minimal" label="All OSM data"
          onClick={this.downloadAllOsm}
          />
        <MenuItem className="pt-minimal" label="Unsubmitted OSM data"
          onClick={this.downloadOsmUnsubmitted}
          />
        <MenuItem className="pt-minimal" label="Conflicting OSM data"
          onClick={this.downloadOsmConflicting}
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
        {this.renderDialog()}
      </div>
    );
  }
};


class TableItemDownload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeBlob: '',
      openDialog: false
    }
  }

  download = (urlEnding, filename) => {
    const authBase64 = new Buffer(
      this.props.userDetails.username + ':' + this.props.userDetails.password
    ).toString('base64');
    return fetch(`/omk/data/submissions/${urlEnding}`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Basic ${authBase64}`
      }
    })
      .then(handleErrors)
      .then(res => res.blob())
      .then(blob => {
        const objURL = URL.createObjectURL(blob);
        this.setState({ activeBlob: objURL });
      });
  }

  downloadFile = (event) => {
    this.download(this.props.urlEnding, this.props.filename);
    this.toggleDialog();
  }

  toggleDialog = () => this.setState({ openDialog: !this.state.openDialog });

  renderDialog() {
    return (
      <Dialog
        icon="cloud-download"
        isOpen={this.state.openDialog}
        onClose={this.toggleDialog}
        title="Download file"
      >
        <div className="pt-dialog-body">
          {(this.props.filename.endsWith('.jpg') || this.props.filename.endsWith('.png'))
            ? <Image src={this.state.activeBlob} responsive className="preview-submission-img" />
          : <p>{this.props.filename}</p>
          }
          <AnchorButton
            intent={Intent.PRIMARY}
            className="pt-small"
            text="Download"
            download={this.props.filename}
            href={this.state.activeBlob}
          />
        </div>
      </Dialog>
    );
  }

  render() {
    if (this.props.filename.endsWith('.osm')) {
      return(
        <div>
          <a onClick={this.downloadFile}>OSM File</a>
          {this.renderDialog()}
        </div>
      );
    } else {
      return(
        <div>
          <a onClick={this.downloadFile}>Download image</a>
          {this.renderDialog()}
        </div>
      );
    }
  }
}


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
      startDate: null,
      endDate: null,
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

  handleFilterStartDate = (date) => {
    if (date) {
      this.setState({ startDate: date.toISOString().split('T')[0]});
    } else {
      this.setState({ startDate: null });
    }
  }

  handleFilterEndDate = (date) => {
    if (date) {
      this.setState({ endDate: date.toISOString().split('T')[0]});
    } else {
      this.setState({ endDate: null });
    }
  }

  handleFilterDeviceIdChange = (event) => {
    this.setState({ filterDeviceId: event.target.value });
  }

  filterSubmissions = () => {
    let filtered = this.state.submissions;
    if (this.state.startDate) {
      filtered = filtered.filter(
        item => moment(this.state.startDate).isBefore(item[3], 'day') || moment(this.state.startDate).isSame(item[3], 'day')
      );
    }
    if (this.state.endDate) {
      filtered = filtered.filter(
        item => moment(this.state.endDate).isAfter(item[3], 'day') || moment(this.state.endDate).isSame(item[3], 'day')
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
    this.setState({ filterStartDate: null });
    this.setState({ filterEndDate: null });
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
      ? <TableItemDownload
          urlEnding={`${this.props.formId}/${this.state.filteredSubmissions[row][column+2]}/${this.state.filteredSubmissions[row][column]}`}
          filename={this.state.filteredSubmissions[row][column]}
          userDetails={this.props.userDetails}
        />
      : <span>No image</span>
    }

  </Cell>;
  renderCellLink = (row, column) => <Cell>
    <TableItemDownload
      urlEnding={`${this.props.formId}/${this.state.filteredSubmissions[row][column+1]}/${this.state.filteredSubmissions[row][column]}`}
      filename={this.state.filteredSubmissions[row][column]}
      userDetails={this.props.userDetails}
    />
  </Cell>;

  render() {
    const isAuthenticated = this.isAuthenticated();
    const filters = {
      deviceId: this.state.filterDeviceId,
      start_date: this.state.startDate,
      end_date: this.state.endDate
    };
    const filterParams = Object.keys(filters).filter(
      i => filters[i]
      ).reduce(
      (base, k) => `${base}${k}=${filters[k]}&`,
      '');
    return(
      <div>
        {isAuthenticated
          ? <div>
              <div className="submissions-info">
                <h2>{ this.state.formName }</h2>
                <p>Total submissions: { this.state.totalSubmissions }</p>
                <SubmissionMenu
                  formId={this.props.formId}
                  filterParams={filterParams}
                  userDetails={this.props.userDetails}
                  />
              </div>
              <Grid className="filters container">
                <Row>
                  <Col xs={12} md={2} mdOffset={2} className="pt-input-group">
                    <label htmlFor="start-date" className="display-block">Start Date</label>
                    <DateInput {...jsDateFormatter}
                      id="start-date"
                      onChange={this.handleFilterStartDate}
                      />
                  </Col>
                  <Col xs={12} md={2} className="pt-input-group">
                    <label htmlFor="end-date" className="display-block">End Date</label>
                    <DateInput {...jsDateFormatter}
                      id="end-date"
                      onChange={this.handleFilterEndDate}
                      />
                  </Col>
                  <Col xs={12} md={2} className="pt-input-group">
                    <label htmlFor="filter-deviceid" className="display-block">Device ID</label>
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