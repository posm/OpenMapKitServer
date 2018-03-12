import { push } from 'react-router-redux';

import * as safeStorage from '../../utils/safe_storage';

export const types = {
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER'
};


export function updateUserDetails(userDetails) {
  return {
    type: types.SET_USER,
    userDetails: userDetails
  };
}
export function clearUserDetails() {
  return {
    type: types.SET_USER,
    userDetails: {}
  };
}

export const logout = () => dispatch => {
  safeStorage.removeItem('id');
  safeStorage.removeItem('username');
  safeStorage.removeItem('password');
  safeStorage.removeItem('role');
  dispatch(clearUserDetails());

};

export const login = (username, password) => dispatch => {
  fetch(`/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
  .then(res => {
    return res.json();
  })
  .then(userDetails => {
    safeStorage.setItem('id', userDetails.user.id);
    safeStorage.setItem('username', userDetails.user.username);
    safeStorage.setItem('password', userDetails.user.password);
    safeStorage.setItem('role', userDetails.user.role);
    dispatch(updateUserDetails(userDetails.user));
  })
  .catch(err => console.warn(err));
};
