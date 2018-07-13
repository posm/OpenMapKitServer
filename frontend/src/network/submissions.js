import { handleErrors } from '../utils/promise';

export function getSubmissions(formId, username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  return fetch(`/omk/odk/submissions/${formId}.json?offset=0&limit=5000`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Basic ${authBase64}`
    }
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}

export function submitToOSM(formId, username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  return fetch(`/omk/odk/submit-changesets/${formId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Basic ${authBase64}`
    }
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}

export function getSubmissionsGeojson(formId, username, password, filterParams): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  let url = `/omk/odk/submissions/${formId}.geojson?${filterParams}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Basic ${authBase64}`
    }
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}
