import { handleErrors } from '../utils/promise';

export function formList(): Promise<*> {
  return fetch(`/formList?json=true`, {
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
