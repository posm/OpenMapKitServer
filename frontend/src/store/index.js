import { applyMiddleware, createStore, compose } from "redux";
import createHistory from "history/createBrowserHistory";
import { routerMiddleware } from "react-router-redux";
import { routerReducer, syncHistoryWithStore } from "react-router-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import { Map } from 'immutable';

import * as actionCreators from "./actions/auth";
import * as safeStorage from '../utils/safe_storage';
import reducers from "./reducers";


const persistedState = {
  auth: {userDetails: {
    id: safeStorage.getItem('username'),
    username: safeStorage.getItem('username'),
    password: safeStorage.getItem('password'),
    role: safeStorage.getItem('role'),
  }}
};

export const history = createHistory()
const middleware = [thunk, routerMiddleware(history)];
const enhancers = [];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.devToolsExtension;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

const store = createStore(
  reducers,
  persistedState,
  composedEnhancers
);

export { store };
