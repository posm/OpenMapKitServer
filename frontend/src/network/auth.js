import { handleErrors } from '../utils/promise';

export function authStatus(): Promise<*> {
  return fetch(`/auth-status/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}

export function login(username: string, password: string): Promise<*> {
  return fetch(`/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password
    })
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}
