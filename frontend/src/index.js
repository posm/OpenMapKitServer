import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from "react-router-dom";
import { Provider } from "react-redux";
import createHistory from "history/createHashHistory";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap-theme.css";
import '@blueprintjs/core/lib/css/blueprint.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './store';

const history = createHistory();
const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
