import { types } from '../actions/auth';

const initialState = {
  userDetails: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_USER: {
      return state.set('userDetails': action.userDetails);
    }
    default:
      return state;
  }
};
