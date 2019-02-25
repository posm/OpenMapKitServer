import React from 'react';
import { connect } from "react-redux";
import { Redirect } from 'react-router';
import moment from 'moment';

import {
  AnchorButton, Button, Popover, Menu, MenuItem, Position, Icon, Dialog, Intent,
  Tooltip
} from "@blueprintjs/core";
import { Cell, Column, Table } from "@blueprintjs/table";
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime";
import { Grid, Row, Col, Image } from 'react-bootstrap';

import { getSubmissions } from '../network/submissions';
import { archiveForm, deleteForm } from '../network/formManagement';
import { handleErrors } from '../utils/promise';
import { formList } from '../network/formList';
import { authStatus } from '../network/auth';
import { cancelablePromise } from '../utils/promise';
import { SubmissionMap } from './submissionMap';
import { LoginPanel } from './loginPanel';
import { setDataView, setPageSize } from '../store/actions/displayPreferences';


const jsDateFormatter: IDateFormatProps = {
    // note that the native implementation of Date functions differs between browsers
    formatDate: date => date.toISOString().split('T')[0],
    parseDate: str => new Date(str),
    placeholder: "YYYY-MM-DD",
};

class SubmissionMenu extends React.Component {
  archiveFormPromise;
  constructor(props) {
    super(props);
    this.state = {
      activeBlob: '',
      downloadName: '',
      openDialog: false,
      formArchivedOrDelete: false
    };
  }

  componentWillUnmount() {
      this.archiveFormPromise && this.archiveFormPromise.cancel();
      this.deleteFormPromise && this.deleteFormPromise.cancel();
  }

  archiveForm = (event) => {
    this.archiveFormPromise = cancelablePromise(
      archiveForm(
        this.props.formId,
        this.props.userDetails.username,
        this.props.userDetails.password
      )
    );
    this.archiveFormPromise.promise.then(
      r => {
        this.setState({ formArchivedOrDelete: true });
      }
    ).catch(e => console.log(e));
  }

  deleteForm = (event) => {
    this.deleteFormPromise = cancelablePromise(
      deleteForm(
        this.props.formId,
        this.props.userDetails.username,
        this.props.userDetails.password
      )
    );
    this.deleteFormPromise.promise.then(
      r => {
        this.setState({ formArchivedOrDelete: true });
      }
    ).catch(e => console.log(e));
  }

  download = (urlEnding, filename) => {
    this.setState({ downloadName: '' });
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

  isAdmin() {
    return this.props.userDetails && this.props.userDetails.role === 'admin';
  }
  downloadCsv = (event) => {
    this.download(`${this.props.formId}.csv`);
    this.toggleDialog();
  }
  downloadJson = (event) => {
    this.download(`${this.props.formId}.json`);
    this.toggleDialog();
  }
  downloadAttachments = (event) => {
    this.download(`${this.props.formId}.zip`);
    this.toggleDialog();
  }
  downloadFilteredCsv = (event) => {
    this.download(`${this.props.formId}.csv?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadFilteredJson = (event) => {
    this.download(`${this.props.formId}.json?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadFilteredAttachments = (event) => {
    this.download(`${this.props.formId}.zip?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadAllOsm = (event) => {
    this.download(`${this.props.formId}.osm`);
    this.toggleDialog();
  }
  downloadFilteredOsm = (event) => {
    this.download(`${this.props.formId}.osm?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadGeojson = (event) => {
    this.download(`${this.props.formId}.geojson`);
    this.toggleDialog();
  }
  downloadFilteredGeojson = (event) => {
    this.download(`${this.props.formId}.geojson?${this.props.filterParams}`);
    this.toggleDialog();
  }
  downloadFeaturesCsv = (event) => {
    this.download(`features/${this.props.formId}.csv`);
    this.toggleDialog();
  }
  downloadFilteredFeaturesCsv = (event) => {
    this.download(`features/${this.props.formId}.csv?${this.props.filterParams}`);
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
          {this.state.downloadName
            ? <div>
                <p>{this.state.downloadName}</p>
                <AnchorButton
                  intent={Intent.PRIMARY}
                  className="pt-small"
                  text="Download"
                  download={this.state.downloadName}
                  href={this.state.activeBlob}
                />
              </div>
            : <div>Loading data, please wait...</div>
          }

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
      <MenuItem className="pt-minimal" icon="th" label="Download Filtered CSV"
        onClick={this.downloadFilteredCsv}
        />
      <MenuItem className="pt-minimal" icon="code" label="Download Filtered JSON"
        onClick={this.downloadFilteredJson}
        />
      <MenuItem className="pt-minimal" icon="compressed" label="Download Filtered Attachments"
        onClick={this.downloadFilteredAttachments}
        />
    </Menu>;
    const osmMenu = <Menu>
        <MenuItem className="pt-minimal" label="Data as OSM"
          onClick={this.downloadAllOsm}
          />
        <MenuItem className="pt-minimal" label="Data as GeoJSON"
          onClick={this.downloadGeojson}
          />
        <MenuItem className="pt-minimal" label="Data as CSV"
          onClick={this.downloadFeaturesCsv}
          />
        {this.props.filterParams && <Menu>
            <MenuItem className="pt-minimal" label="Filtered data as OSM"
              onClick={this.downloadFilteredOsm}
              />
            <MenuItem className="pt-minimal" label="Filtered data as GeoJSON"
              onClick={this.downloadFilteredGeojson}
              />
            <MenuItem className="pt-minimal" label="Filtered data as CSV"
              onClick={this.downloadFilteredFeaturesCsv}
              />
          </Menu>
        }
      </Menu>;
    const manageMenu = <Menu>
        <MenuItem className="pt-minimal" icon="add-to-folder" label="Archive Form"
          onClick={this.archiveForm}
          />
        {!this.props.hasSubmissions &&
          <MenuItem className="pt-minimal" icon="trash" label="Delete Form"
            onClick={this.deleteForm}
            />
        }
      </Menu>;
    return (
      <div>
        {!this.state.formArchivedOrDelete
          ? <div>
              <Popover content={omkMenu} position={Position.BOTTOM} className="pt-intent-default">
                <Button icon="link">ODK Data <Icon icon="caret-down" /></Button>
              </Popover>
              <Popover content={osmMenu} position={Position.BOTTOM} className="pt-intent-default">
                <Button icon="path-search">OSM Data <Icon icon="caret-down" /></Button>
              </Popover>
              {this.isAdmin() &&
                <Popover content={manageMenu} position={Position.BOTTOM}
                  className="pt-intent-default"
                >
                  <Button icon="cog">Manage <Icon icon="caret-down" /></Button>
                </Popover>
              }
              {this.renderDialog()}
            </div>
          : <Redirect to='/' />
        }
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
    this.setState({ downloadName: '' });
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
        this.setState({
          downloadName: filename ? filename : urlEnding.split('?')[0]
        });
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
          {this.state.downloadName
            ? <div>
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
            : <div>Loading data, please wait...</div>
          }
        </div>
      </Dialog>
    );
  }

  render() {
    if (this.props.filename) {
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
    } else {
      return(
        <span>No data</span>
      );
    }
  }
}


class SubmissionList extends React.Component {
  getSubmissionsPromise;
  getFormDetailsPromise;
  getAuthStatusPromise;

  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
      filteredSubmissions: [],
      slicedSubmissions: [],
      loading: true,
      formName: '',
      totalSubmissions: 0,
      startDate: null,
      endDate: null,
      filterDeviceId: '',
      filterUsername: '',
      filterParams: 'offset=0&limit=200',
      hasUsername: false,
      dataView: props.dataView || 'map',
      page: 1,
      pageSize: props.pageSize || 200,
      pageCount: 1,
      authEnabled: true
    }
  }

  componentWillUnmount() {
    this.getSubmissionsPromise && this.getSubmissionsPromise.cancel();
    this.getFormDetailsPromise && this.getFormDetailsPromise.cancel();
    this.getAuthStatusPromise && this.getAuthStatusPromise.cancel();
  }

  componentDidMount() {
    this.getSubmissions();
    this.getFormDetails();
    if (!(this.props.userDetails && this.props.userDetails.username != null)) {
      this.getAuthStatus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.userDetails.username !== prevProps.userDetails.username) {
      this.getSubmissions();
    }
    if (prevState.page !== this.state.page || prevProps.pageSize !== this.props.pageSize) {
      this.updateFilterParams();
    }
  }

  updatePagination(newPageSize, filtered) {
    if (filtered.length > newPageSize) {
      const mod = filtered.length % newPageSize;
      this.setState({'pageCount': ((filtered.length - mod) / newPageSize) + 1});
    } else {
      this.setState({'pageCount': 1});
    }
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

  handleFilterUsernameChange = (event) => {
    this.setState({ filterUsername: event.target.value });
  }

  handlePageChange = (event) => {
    this.setState({ loading: true });
    this.setState({ page: event.target.value });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 10);
  }

  handlePageSizeChange = (event) => {
    this.setState({ loading: true });
    this.props.updatePageSize(event.target.value);
    this.setState({ pageSize: event.target.value });
    this.updatePagination(event.target.value, this.state.filteredSubmissions);
    setTimeout(() => {
      this.setState({ loading: false });
    }, 10);
  }

  handleDataViewChange = (option) => {
    this.props.updateDataView(option);
    this.setState({ dataView: option });
  }

  updateFilterParams() {
    const filters = {
      deviceId: this.state.filterDeviceId,
      start_date: this.state.startDate,
      end_date: this.state.endDate,
      username: this.state.filterUsername,
      offset: (this.state.page - 1) * this.state.pageSize || 0,
      limit: this.state.pageSize || 200
    };
    const filterParams = Object.keys(filters).filter(
      i => filters[i]
    ).reduce(
      (base, k) => `${base}${k}=${filters[k]}&`,
    '');
    this.setState({'filterParams': filterParams});
  }

  filterSubmissions = () => {
    this.setState({ loading: true });
    this.updateFilterParams();
    this.setState({ page: 1 });
    let filtered = this.state.submissions;
    if (this.state.startDate) {
      filtered = filtered.filter(
        item =>
          moment(this.state.startDate).isBefore(item[3], 'day') ||
          moment(this.state.startDate).isSame(item[3], 'day')
      );
    }
    if (this.state.endDate) {
      filtered = filtered.filter(
        item =>
          moment(this.state.endDate).isAfter(item[3], 'day') ||
          moment(this.state.endDate).isSame(item[3], 'day')
      );
    }
    if (this.state.filterDeviceId) {
      filtered = filtered.filter(
        item => item[2] && item[2].toString().includes(this.state.filterDeviceId)
      );
    }
    if (this.state.filterUsername) {
      filtered = filtered.filter(
        item => item[2] && item[2].toString().includes(this.state.filterUsername)
      );
    }
    this.setState({ filteredSubmissions: filtered });
    this.updatePagination(this.state.pageSize, filtered);
    this.setState({ loading: false });
  }

  clearFilter = () => {
    this.setState({ loading: true });
    this.setState({ filteredSubmissions: this.state.submissions });
    this.setState({ filterStartDate: null });
    this.setState({ filterEndDate: null });
    this.setState({ filterDeviceId: '' });
    this.setState({ filterUsername: '' });
    this.updatePagination(this.state.pageSize, this.state.submissions);
    this.setState({ loading: false });
    this.setState({
      filterParams: `offset=${(this.state.page - 1) * this.state.pageSize || 0}&limit=${this.state.pageSize}`
    });
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

  getPageSlice() {
    return this.state.filteredSubmissions.slice(
      (this.state.page - 1) * this.state.pageSize,
      this.state.page * this.state.pageSize
    );
  }
  getAuthStatus = () => {
    this.getAuthStatusPromise = cancelablePromise(
      authStatus()
    );
    this.getAuthStatusPromise.promise.then(
      r => {
        console.log('response ' + r.auth_enabled);
        this.setState({ authEnabled: r.auth_enabled });
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
          i.end ? i.end : i.meta.submissionTime,
          i.username ? i.username : i.deviceid,
          i.meta.submissionTime,
          i.image,
          Object.values(i).filter(
            entry => typeof(entry) === 'string' && entry.endsWith('.osm')
          )[0],
          i.meta.instanceId.split(':')[1],
        ]);
        if (r.length > 0 && r[0].hasOwnProperty('username')) {
          this.setState({ hasUsername: true });
        }
        this.setState({ submissions: data });
        this.setState({ filteredSubmissions: data });
        this.setState({ loading: false });
        this.updatePagination(this.state.pageSize, data);
      }
    ).catch(e => {
      console.log(e);
      this.setState({ loading: false });
    });
  }

  renderDateCell = (data) => moment(data).format('lll');

  renderCellImage = (line, column) => line[column]
    ? <TableItemDownload
        urlEnding={`${this.props.formId}/${line[column+2]}/${line[column]}`}
        filename={line[column]}
        userDetails={this.props.userDetails}
      />
    : <span>No image</span>
  ;

  renderCellLink = (line, column) => <TableItemDownload
      urlEnding={`${this.props.formId}/${line[column+1]}/${line[column]}`}
      filename={line[column]}
      userDetails={this.props.userDetails}
  />;

  renderFilterSection() {
    let devices = this.state.submissions.map(item => item[2]);
    devices = devices.filter(i => i !== undefined).filter((i, k) => devices.indexOf(i) === k);
    return(
      <Row className="filters ml-0 mr-0">
        <Row className="ml-0 mr-0">
          <Col xs={12} md={6} className="pt-input-group">
            <label htmlFor="start-date" className="display-block">
              From
              <Tooltip content="Based on the Submission Date" position={Position.RIGHT}>
                <Icon icon="help" color="#CED9E0" className="help-icon"/>
              </Tooltip>
            </label>
            <DateInput {...jsDateFormatter}
              id="start-date"
              onChange={this.handleFilterStartDate}
              />
          </Col>
          <Col xs={12} md={6} className="pt-input-group">
            <label htmlFor="end-date" className="display-block">
              To
              <Tooltip content="Based on the Submission Date" position={Position.RIGHT}>
                <Icon icon="help" color="#CED9E0" className="help-icon"/>
              </Tooltip>
            </label>
            <DateInput {...jsDateFormatter}
              id="end-date"
              onChange={this.handleFilterEndDate}
              />
          </Col>
        </Row>
        <Row className="ml-0 mr-0">
          {this.state.hasUsername
            ? <Col xs={12} className="pt-input-group">
                <label htmlFor="filter-username" className="display-block">
                  Username
                </label>
                <div className="pt-select">
                  <select onChange={this.handleFilterUsernameChange} value={this.state.filterUsername}>
                    <option value={null} >Choose an item...</option>
                    {devices.map(
                      (item, k) =>
                      <option key={k} value={ `${item}` }>
                        { item.toString() }
                      </option>
                    )}
                  </select>
                </div>
              </Col>
            : <Col xs={12} className="pt-input-group">
                <label htmlFor="filter-deviceid" className="display-block">
                  Device ID
                </label>
                <div className="pt-select">
                  <select onChange={this.handleFilterDeviceIdChange} value={this.state.filterDeviceId}>
                    <option value={null} >Choose an item...</option>
                    {devices.map(
                      (item, k) =>
                      <option key={k} value={ `${item}` }>
                        { item.toString() }
                      </option>
                    )}
                  </select>
                </div>
              </Col>
            }
        </Row>
        <Row className="ml-0 mr-0">
          <Col xs={12} md={6} className="pt-input-group">
            <Button className="pt-intent-success filter-btn"
              icon="filter" text="Filter" onClick={this.filterSubmissions}
              />
          </Col>
          <Col xs={12} md={6} className="pt-input-group">
            <Button className="pt-intent-danger filter-btn"
              icon="filter-remove" text="Clear" onClick={this.clearFilter}
              />
          </Col>
        </Row>
      </Row>
    );
  }

  renderTable() {
    if (this.state.loading) {
      return(<div id="loading-msg">Loading data, please wait...</div>);
    } else {
      if (this.state.filteredSubmissions.length === 0) {
        return(<div id="loading-msg">No data was found.</div>);
      } else {
        return (
          <table class="pt-html-table pt-html-table-bordered pt-interactive mb-20 mt-10">
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                {this.state.hasUsername
                  ? <th>Username</th>
                  : <th>Device ID</th>
                }
                <th>Submission Time</th>
                <th>Image</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {this.getPageSlice().map(line =>
                  <tr>
                    <td>{this.renderDateCell(line[0])}</td>
                    <td>{this.renderDateCell(line[1])}</td>
                    <td>{line[2]}</td>
                    <td>{this.renderDateCell(line[3])}</td>
                    <td>{this.renderCellImage(line, 4)}</td>
                    <td>{this.renderCellLink(line, 5)}</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        );
      }
    }
  }

  renderMapSwitchButton() {
    return(
      <Row className="ml-0 mr-0">
        <Col xs={12}>
          {this.state.dataView === 'map'
            ? <Button className="pt-intent" icon="th" text="Switch to Table view"
                onClick={() => this.handleDataViewChange('table')}
                />
            : <Button className="pt-intent" icon="map" text="Switch to Map view"
                onClick={() => this.handleDataViewChange('map')}
                />
          }
        </Col>
      </Row>
    );
  }

  renderPagination() {
    return(
      <Row className="pagination pt-input-group ml-0 mr-0">
        <Col xs={12} md={6} className="pt-input-group">
          <label className="display-block">Page Size</label>
          <div className="pt-select">
            <select onChange={this.handlePageSizeChange} value={this.state.pageSize}>
                {[1000, 800, 600, 400, 200, 100, 50, 20].map(
                  (item, k) =>
                  <option key={k} value={ item }>
                    { item.toString() }
                  </option>
                )}
              </select>
          </div>
        </Col>
        <Col xs={12} md={6} className="pt-input-group">
          <label className="display-block">Page</label>
          <div className="pt-select">
            <select onChange={this.handlePageChange}>
              {Array.apply(null, { length: this.state.pageCount }).map(
                Number.call, Number
              ).map(
                i => i + 1
              ).map(
                (item, k) =>
                <option key={k} value={ item }>
                  { item.toString() }
                </option>
              )}
            </select>
          </div>
        </Col>
      </Row>
    );
  }

  render() {
    const isAuthenticated = (this.props.userDetails &&
        this.props.userDetails.username != null) || !this.state.authEnabled;

    return(
      <div>
        {isAuthenticated
          ? <Grid fluid={true} className="pl-0 pr-0">
              <Row className="ml-0 mr-0">
                <Col xs={12} md={3} className="sticky">
                  <div className="submissions-info">
                    <h4 className="break-all">{ this.state.formName }</h4>
                    <p>Total submissions: { this.state.totalSubmissions }</p>
                    <SubmissionMenu
                      formId={this.props.formId}
                      hasSubmissions={this.state.totalSubmissions > 0}
                      filterParams={this.state.filterParams}
                      userDetails={this.props.userDetails}
                      />
                  </div>
                  { this.renderFilterSection() }
                  { this.renderPagination() }
                  { this.renderMapSwitchButton() }
                </Col>
                <Col xs={12} md={9} className="ml-0 mr-0 pr-0">
                  {this.state.dataView === 'map'
                    ? <SubmissionMap
                        userDetails={this.props.userDetails}
                        formId={this.props.formId}
                        filterParams={this.state.filterParams}
                        hasUsername={this.state.hasUsername}
                      />
                    : this.renderTable()
                  }
                </Col>
              </Row>
            </Grid>
          : <LoginPanel />
        }
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateDataView: (option) => dispatch(setDataView(option)),
    updatePageSize: (option) => dispatch(setPageSize(option))
  };
};


SubmissionList = connect(
  (state, props) => ({
    userDetails: state.auth.userDetails,
    formId: props.match.params.formId,
    dataView: state.preferences.dataView,
    pageSize: state.preferences.pageSize
  }),
  mapDispatchToProps
)(SubmissionList)

export {SubmissionList};
