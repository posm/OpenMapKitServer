import React from 'react';
import { connect } from "react-redux";
import { Redirect } from 'react-router'
import moment from 'moment';
import mapboxgl from 'mapbox-gl';
import { extent } from 'geojson-bounds';

import {
  AnchorButton, Button, Popover, Menu, MenuItem, Position, Icon, Dialog, Intent,
  Tooltip
} from "@blueprintjs/core";
import { Link } from "react-router-dom";
import { getSubmissionsGeojson } from '../network/submissions';


const jsDateFormatter: IDateFormatProps = {
    // note that the native implementation of Date functions differs between browsers
    formatDate: date => date.toISOString().split('T')[0],
    parseDate: str => new Date(str),
    placeholder: "YYYY-MM-DD",
};

class SubmissionMap extends React.Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaG90IiwiYSI6IlBtUmNiR1kifQ.dCS1Eu9DIRNZGktc24IwtA';
    const map = new mapboxgl.Map({
      container: 'map',
        style: 'mapbox://styles/mapbox/satellite-v9',
    });
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.on('load', () => {
      getSubmissionsGeojson(
        this.props.formId,
        this.props.userDetails.username,
        this.props.userDetails.password
      ).then(data => {
        console.log(data);
        map.addSource('submissions', {
          "type": "geojson",
          "data": data
        });
        map.addLayer({
          "id": "submission_lines",
          "type": "line",
          "source": "submissions",
          "filter": ["==", "$type", "LineString"],
          "paint": {
            "line-color": "#11b4da",
            "line-width": 3
          }
        });
        map.addLayer({
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
        map.addLayer({
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
        console.log(extent(data));
        map.fitBounds(
          extent(data),
          {"padding": {top: 80, bottom: 35, left: 35, right: 35}}
        );
      });
    });
    ['submission_areas', 'submission_lines', 'submission_points'].forEach(
      layer => {
        map.on('click', layer, function(e) {
          const keys = Object.keys(e.features[0].properties);
          const values = Object.values(e.features[0].properties);
          const table_content = keys.map(
            (key, n) => `<tr><td class="feature-key">${key}</td><td class="feature-value">${values[n]}</td></tr>`
          );

          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<table><tbody>${table_content}</tbody></table>`)
            .addTo(map);
        });

        map.on('mouseenter', layer, function () {
          map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', layer, function () {
          map.getCanvas().style.cursor = '';
        });
      }
    );
  }

  render() {
    return(
      <div>
        <div id="map">
          <div className="map-title">
            <h2>{this.props.formId} map</h2>
              <Link to={`/submissions/${this.props.formId}`}>
                <Icon icon="arrow-left" /> Submission list page
              </Link>
          </div>
        </div>
      </div>
    );
  }
}

SubmissionMap = connect(
  (state, props) => ({
    userDetails: state.auth.userDetails,
    formId: props.match.params.formId
  })
)(SubmissionMap)

export {SubmissionMap};
