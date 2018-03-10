import { handleErrors } from '../utils/promise';

export function formList(formId): Promise<*> {
  let url = `/formList?json=true`
  if (formId) {
    url = `/formList?json=true&formid=${formId}`
  }
  return fetch(url, {
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
