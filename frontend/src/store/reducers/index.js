import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import { authReducer } from './auth';
import { preferencesReducer } from './displayPreferences';


export default combineReducers({
  auth: authReducer,
  preferences: preferencesReducer,
  router: routerReducer,
});
