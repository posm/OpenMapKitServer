import { types } from '../actions/auth';

const initialState = {
  userDetails: new Map()
};

export function authReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_USER: {
      return {'userDetails': action.userDetails};
    }
    default:
      return state;
  }
}
