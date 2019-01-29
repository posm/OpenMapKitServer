import { handleErrors } from '../utils/promise';


export function deploymentList(deployment): Promise<*> {
  let url = `/omk/deployments/`
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

export function createDeploymentFolder(deployment, username, password): Promise<*> {
  const authBase64 = new Buffer(username + ':' + password).toString('base64');
  let url = `/omk/odk/deployments/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Basic ${authBase64}`
    },
    body: JSON.stringify({
      name: deployment
    })
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}
