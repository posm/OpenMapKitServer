export const types = {
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER'
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
    dispatch({
      type: types.SET_USER,
      userDetails: userDetails.user
    });
  })
  .catch(err => console.warn(err));
}
