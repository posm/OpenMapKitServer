import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import * as actionCreators from "./actions/auth";
import reducers from "./reducers";


export default preloadedState => {
  const composeEnhancers = composeWithDevTools({ actionCreators });
  const store = createStore(
    reducers,
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        thunk,
        createLogger({
          collapsed: true
        })
      )
    )
  );
};
