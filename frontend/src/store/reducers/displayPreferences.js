import { types } from '../actions/auth';

const initialState = {
  displayPreferences: new Map()
};

export function preferencesReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_PAGE_SIZE: {
      return {'pageSize': action.pageSize};
    }
    case types.SET_DATA_VIEW: {
      return {'dataView': action.dataView};
    }
    default:
      return state;
  }
};
