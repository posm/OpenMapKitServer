import { applyMiddleware, createStore } from "redux";
import createHistory from "history/createBrowserHistory";
import { routerMiddleware } from "react-router-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import * as actionCreators from "./actions/auth";
import reducers from "./reducers";


const history = createHistory();

export default preloadedState => {
  const composeEnhancers = composeWithDevTools({ actionCreators });
  const store = createStore(
    reducers,
    preloadedState,
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
  return store;
};
