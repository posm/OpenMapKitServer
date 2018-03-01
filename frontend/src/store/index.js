import { applyMiddleware, createStore } from "redux";
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

const history = createHistory()
const composeEnhancers = composeWithDevTools({ actionCreators });

const store = createStore(
  reducers,
  persistedState,
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk,
      createLogger({
        collapsed: true
      })
    )
  )
);

export { store };
