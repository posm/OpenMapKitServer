import { types } from '../actions/auth';

const initialState = {
  pageSize: 200,
  dataView: 'map'
};

export function preferencesReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_PAGE_SIZE: {
      return state.set('pageSize', action.pageSize);
    }
    case types.SET_DATA_VIEW: {
      return state.set('dataView', action.dataView);
    }
    default:
      return state;
  }
}
