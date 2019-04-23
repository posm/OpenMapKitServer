import { types } from '../actions/displayPreferences';

const initialState = {
  pageSize: 200,
  dataView: 'map'
};

export function preferencesReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_PAGE_SIZE: {
      return {
        'pageSize': action.pageSize,
        'dataView': state.dataView
      };
    }
    case types.SET_DATA_VIEW: {
      return {
        'pageSize': state.pageSize,
        'dataView': action.dataView
      };
    }
    default:
      return state;
  }
}
