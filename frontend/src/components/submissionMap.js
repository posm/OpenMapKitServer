import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Set } from 'immutable';
import { extent } from 'geojson-bounds';
import { array as countPerDay } from 'count-per-day';
import { RadioGroup, Radio, Icon } from "@blueprintjs/core";

import { getSubmissionsGeojson } from '../network/submissions';

const COLOR_STEPS = [
  "#29A634", "#1F4B99", "#D99E0B", "#D13913", "#8F398F", "#00B3A4", "#728C23",
  "#DB2C6F", "#B07B46", "#7157D9", "#B6D94C", "#63411E"
];
const OTHER_COLOR = '#4580E6';

function orderKeys(obj) {
  const ordered = {};
  Object.keys(obj).sort().forEach(function(key) {
    ordered[key] = obj[key];
  });
  return ordered;
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

export class SubmissionMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = null
    this.state = {
      info_content: '',
      display_map_info: 'none',
      data: {},
      showVizTypeSwitch: false,
      vizType: 'default',
      legend: []
    };
  }

  get_paint_property(data) {
    if (this.state.vizType === 'default') {
      return OTHER_COLOR;
    }
    if (this.state.vizType === 'date') {
      return this.get_color_steps_by_date(data);
    }
    if (this.state.vizType === 'user') {
      return this.get_color_steps_by_user(data);
    }
  }

  get_color_steps_by_date(data) {
    // set colour features colours
    let legend = [];
    const submissionDates = countPerDay(data.features.map(
      feature => new Date(feature.properties.submission_date)
    )).filter(item => item.count);
    const orderedSubmissionDates = sortByKey(submissionDates, 'count');
    let steps = ['match', ['get', 'submission_date']];
    orderedSubmissionDates.slice(0, 12)
      .map((date, n) => {
        steps = steps.concat([date.day, COLOR_STEPS[n]]);
        legend.push([date.day, COLOR_STEPS[n]]);
      }
    );
    steps.push(OTHER_COLOR);
    legend.push(['Others', OTHER_COLOR]);
    this.setState({'legend': legend});
    return steps;
  }

  get_color_steps_by_user(data) {
    var users, property_key;
    let legend = [];
    if (this.props.hasUsername) {
      users = data.features.map(
        feature => feature.properties.submission_user
      );
      property_key = 'submission_user';
    } else {
      users = data.features.map(
        feature => feature.properties.submission_deviceid
      );
      property_key = 'submission_deviceid';
    }
    const setUsers = new Set(users);
    var userCount = [];
    setUsers.map(user => userCount.push(
      {'user': user, 'count': users.filter(i => i === user).length}
    ));
    userCount = sortByKey(userCount, 'count');
    let steps = ['match', ['get', property_key]];
    userCount.slice(0, 12)
      .map((user, n) => {
        steps = steps.concat([user.user, COLOR_STEPS[n]]);
        legend.push([user.user, COLOR_STEPS[n]]);
      });
    steps.push(OTHER_COLOR);
    legend.push(['Others', OTHER_COLOR])
    this.setState({'legend': legend});
    return steps;
  }

  add_data_to_map() {
    if (this.map.getSource('submissions')) {
      ['submission_areas', 'submission_lines', 'submission_points'].map(
        layer => this.map.removeLayer(layer)
      );
      this.map.removeSource('submissions');
    }
    getSubmissionsGeojson(
      this.props.formId,
      this.props.userDetails.username,
      this.props.userDetails.password,
      this.props.filterParams
    ).then(data => {
      this.setState({'showVizTypeSwitch': true});
      // exclude nodes that doesn't have OSM tags
      data['features'] = data.features.filter(i => Object.keys(i.properties).length > 7);
      this.setState({'data': data});
      const steps = this.get_paint_property(data);

      this.map.addSource('submissions', {
        "type": "geojson",
        "data": data
      });
      this.map.addLayer({
        "id": "submission_lines",
        "type": "line",
        "source": "submissions",
        "filter": ["==", "$type", "LineString"],
        "paint": {
          "line-color": steps,
          "line-width": 3
        }
      });
      this.map.addLayer({
        "id": "submission_areas",
        "type": "fill",
        "source": "submissions",
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "fill-color": steps,
          "fill-opacity": 0.4,
          "fill-outline-color": "#61FC03"
        }
      });
      this.map.addLayer({
        "id": "submission_points",
        "type": "circle",
        "source": "submissions",
        "filter": ["==", "$type", "Point"],
        "paint": {
          "circle-color": steps,
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff"
        }
      });
      this.map.fitBounds(
        extent(data),
        {"padding": {top: 80, bottom: 35, left: 35, right: 35}, "linear": true}
      );
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.filterParams !== prevProps.filterParams) {
      this.add_data_to_map();
    }
    if (this.state.vizType !== prevState.vizType) {
      const steps = this.get_paint_property(this.state.data);
      this.map.setPaintProperty(
        'submission_lines', 'line-color', steps
      );
      this.map.setPaintProperty(
        'submission_areas', 'fill-color', steps
      );
      this.map.setPaintProperty(
        'submission_points', 'circle-color', steps
      );
    }
  }

  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaG90IiwiYSI6IlBtUmNiR1kifQ.dCS1Eu9DIRNZGktc24IwtA';
    this.map = new mapboxgl.Map({
      container: 'map',
        style: 'mapbox://styles/mapbox/satellite-v9',
    });
    this.map.addControl(new mapboxgl.NavigationControl(), "top-right");
    this.map.on('load', () => {
      this.add_data_to_map();
    });
    this.map.on('click', e => {
      var x1y1 = [e.point.x - 5, e.point.y - 5];
      var x2y2 = [e.point.x + 5, e.point.y + 5];
      var features = this.map.queryRenderedFeatures([x1y1, x2y2], {
        layers: ['submission_areas', 'submission_lines', 'submission_points']
      });
      if (features.length) {
        const properties = orderKeys(features[0].properties);
        const keys = Object.keys(properties);
        const values = Object.values(properties);
        this.setState({
          info_content: keys.map((key, n) =>
            <tr key={n}>
              <td className="feature-key">{key}</td>
              <td className="feature-value">{values[n]}</td>
            </tr>
          )
        });
        this.setState({
          display_map_info: 'block'
        });
      } else {
        this.setState({
          display_map_info: 'none',
          info_content: ''
        });
      }
    });
    ['submission_areas', 'submission_lines', 'submission_points'].forEach(
      layer => {
          this.map.on('mouseenter', layer, () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', layer, () => {
          this.map.getCanvas().style.cursor = '';
        });
      }
    );
  }

  render() {
    return(
      <div>
        <div id="map">
          <div className={`map-info ${this.state.info_content && 'display-block'}`}>
              <table><tbody>{this.state.info_content}</tbody></table>
          </div>
          {this.state.showVizTypeSwitch &&
            <div className="color-switch">
              <RadioGroup
                label="Features colouring"
                onChange={e => this.setState({ vizType: e.target.value })}
                selectedValue={this.state.vizType}
                >
                <Radio label="Default Color" value="default" />
                <Radio label="By Submission Date" value="date" />
                <Radio label={`By ${this.props.hasUsername ? 'User' : 'Device ID'}`} value="user" />
              </RadioGroup>
              {this.state.vizType !== 'default' &&
                <div>
                  <label class="pt-label">Legend</label>
                  {this.state.legend.map(
                    (item, n) => <div key={n}>
                        <Icon icon="full-circle" color={`${item[1]}`} /> <span>{item[0]}</span>
                      </div>
                  )}
                </div>
              }
            </div>
          }
        </div>
      </div>
    );
  }
}
