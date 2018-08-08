import { handleErrors } from '../utils/promise';


export function archivedForms(username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  return fetch('/omk/odk/archived-forms', {
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

export function restoreForm(formName, username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  const url = `/omk/odk/forms/${formName}/restore`
  return fetch(url, {
    method: 'POST',
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

export function archiveForm(formName, username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  const url = `/omk/odk/forms/${formName}/archive`
  return fetch(url, {
    method: 'POST',
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

export function deleteForm(formName, username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  const url = `/omk/odk/forms/${formName}/delete`
  return fetch(url, {
    method: 'POST',
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
