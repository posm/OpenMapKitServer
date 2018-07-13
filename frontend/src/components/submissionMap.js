import React from 'react';
import mapboxgl from 'mapbox-gl';
import { extent } from 'geojson-bounds';

import { getSubmissionsGeojson } from '../network/submissions';

function orderKeys(obj) {
  const ordered = {};
  Object.keys(obj).sort().forEach(function(key) {
    ordered[key] = obj[key];
  });
  return ordered;
}

export class SubmissionMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = null
    this.state = {
      info_content: '',
      display_map_info: 'none',
      data: {}
    };
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
      this.setState({'data': data});
      this.map.addSource('submissions', {
        "type": "geojson",
        "data": this.state.data
      });
      this.map.addLayer({
        "id": "submission_lines",
        "type": "line",
        "source": "submissions",
        "filter": ["==", "$type", "LineString"],
        "paint": {
          "line-color": "#11b4da",
          "line-width": 3
        }
      });
      this.map.addLayer({
        "id": "submission_areas",
        "type": "fill",
        "source": "submissions",
        "filter": ["in", "$type", "Polygon"],
        "paint": {
          "fill-color": "#000",
          "fill-opacity": 0.3,
          "fill-outline-color": "#11b4da"
        }
      });
      this.map.addLayer({
        "id": "submission_points",
        "type": "circle",
        "source": "submissions",
        "filter": ["==", "$type", "Point"],
        "paint": {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff"
        }
      });
      this.map.fitBounds(
        extent(this.state.data),
        {"padding": {top: 80, bottom: 35, left: 35, right: 35}, "linear": true}
      );
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.filterParams !== prevProps.filterParams) {
      this.add_data_to_map();
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
        console.log(properties);
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
        </div>
      </div>
    );
  }
}
