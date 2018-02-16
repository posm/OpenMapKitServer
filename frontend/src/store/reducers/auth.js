import { types } from '../actions/auth';

const initialState = {
  userDetails: {},
  password: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_USER: {
      return state.set('userDetails': action.userDetails);
    }
    case types.SET_PASSWORD: {
      return state.set('password': action.password);
    }
    default:
      return state;
  }
};
